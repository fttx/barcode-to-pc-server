
import { Credentials, OAuth2Client } from 'google-auth-library';
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { drive_v3, google } from 'googleapis';
import * as http from 'http';
import * as Url from 'url';
import { Config } from '../config';
import { shell, ipcMain } from "electron";
import { Handler } from '../models/handler.model';


export class GSheetHandler implements Handler {
    public static scopes = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.metadata.readonly'];
    private ipcClient;
    private static instance: GSheetHandler;
    public static httpAuthServer: http.Server;

    constructor(
    ) {
        ipcMain.on('gsheet_refresh_data', async (event, args) => {
            const data: { tokens: any, spreadSheets: ({ id: string, name: string }[]) } = args[0];
            const oAuth2Client = await this.getAuthenticatedClient(data.tokens);
            try {
                const drive = google.drive({ version: 'v3', auth: oAuth2Client });
                const res = await drive.files.list({ q: "mimeType='application/vnd.google-apps.spreadsheet'", fields: 'nextPageToken, files(id, name)' });
                if (res.data.files) {
                    this.ipcClient.send('gsheet_refresh_data', { tokens: oAuth2Client.credentials, spreadSheets: res.data.files });
                }
            } catch (e) {
                this.showErrorNativeDialog('gsheetErrorFailedToGetList', { email: Config.EMAIL_SUPPORT });
            }
        });

        ipcMain.on('gsheet_refresh_tokens', async (event, args) => {
            const savedTokens = args[0];
            if (!savedTokens || !savedTokens.refresh_token) return;

            const oAuth2Client = new OAuth2Client(Config.GAPIS_CREDENTIALS.client_id, Config.GAPIS_CREDENTIALS.client_secret, Config.GAPIS_CREDENTIALS.redirect_uri);
            oAuth2Client.setCredentials(savedTokens);
            oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: GSheetHandler.scopes });
            const tokenResponse = await oAuth2Client.refreshAccessToken();
            this.ipcClient.send('gsheet_refresh_tokens', tokenResponse.credentials);
        });
    }

    async get(sheetId: string, workSheetIndex: number, searchColumnA1: string, searchValue: string, columnToReadA1: string, matchCriteria: 'all' | 'first' | 'last' = 'first'): Promise<string> {
        const workSheet = await this.getWorkSheet(sheetId, workSheetIndex);
        const rows = await workSheet.getRows();
        const lookupColumnIndex = searchColumnA1.toUpperCase().charCodeAt(0) - 65;
        const replaceColumnIndex = columnToReadA1.toUpperCase().charCodeAt(0) - 65;

        // Find and read the correspondig cell
        for (let i = 0; i < rows.length; i++) {
            const index = matchCriteria === 'last' ? rows.length - 1 - i : i;
            const row = rows[index];
            if (row._rawData[lookupColumnIndex] == searchValue) {
                return row._rawData[replaceColumnIndex];
            }
        }
        return null;
    }

    async update(sheetId: string, workSheetIndex: number, searchColumnA1: string, searchValue: string, columnToUpdateA1: string, newValue: string, matchCriteria: 'all' | 'first' | 'last' = 'first'): Promise<string> {
        const workSheet = await this.getWorkSheet(sheetId, workSheetIndex);
        const rows = await workSheet.getRows();
        const lookupColumnIndex = searchColumnA1.toUpperCase().charCodeAt(0) - 65;
        const replaceColumnIndex = columnToUpdateA1.toUpperCase().charCodeAt(0) - 65;

        let needleFound = false;
        // Find and update the values row by row
        for (let i = 0; i < rows.length; i++) {
            const index = matchCriteria === 'last' ? rows.length - 1 - i : i;
            const row = rows[index];
            if (row._rawData[lookupColumnIndex] === searchValue) {
                row._rawData[replaceColumnIndex] = newValue;
                await row.save();
                needleFound = true;
                // If its the first or last match, exit
                if (matchCriteria !== 'all') return newValue;
            }
        }
        return needleFound ? newValue : null;
    }

    async append(sheetId: string, workSheetIndex: number, columnsToAppend: string[]): Promise<boolean> {
        const workSheet = await this.getWorkSheet(sheetId, workSheetIndex);
        await workSheet.addRow(columnsToAppend);
        await workSheet.saveUpdatedCells();
        return true;
    }


    private async getWorkSheet(sheetId: string, workSheetIndex: number) {
        const savedTokens = await this.getSavedTokens();
        const spreadSheet = new GoogleSpreadsheet(sheetId);
        spreadSheet.useOAuth2Client(await this.getAuthenticatedClient(savedTokens));
        await spreadSheet.loadInfo();
        const workSheet = spreadSheet.sheetsByIndex[workSheetIndex];
        await workSheet.loadCells();
        return workSheet;
    }


    private getSavedTokens(): Promise<Credentials> {
        return new Promise<Credentials>(resolve => {
            ipcMain.on('gsheet_get_saved_tokens', async (event, args) => {
                ipcMain.removeAllListeners('gsheet_get_saved_tokens');
                resolve(args[0]);
            });
            this.ipcClient.send('gsheet_get_saved_tokens');
        });
    }

    private showErrorNativeDialog(translateStringId: string, interpolateParams?: Object) {
        this.ipcClient.send('showErrorNativeDialog', translateStringId, interpolateParams);
    }

    private getAuthenticatedClient(savedTokens: any): Promise<OAuth2Client> {
        return new Promise(async (resolve, reject) => {
            const oAuth2Client = new OAuth2Client(Config.GAPIS_CREDENTIALS.client_id, Config.GAPIS_CREDENTIALS.client_secret, Config.GAPIS_CREDENTIALS.redirect_uri);

            if (savedTokens) {
                oAuth2Client.setCredentials(savedTokens);
                // Make a call to google to see if the token is valid
                try {
                    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
                    const res = await drive.files.list({ q: "mimeType='application/vnd.google-apps.spreadsheet'", fields: 'nextPageToken, files(id, name)' });
                    if (res.status !== 401) {
                        // Resolve & Exit
                        resolve(oAuth2Client);
                        return;
                    }
                } catch (e) {
                    console.log('GSHEETS: Cannot login with the current token, opening consent dialog...', e);
                    this.showErrorNativeDialog('cannotAccessSpreadsheetError');
                    // If instead an errow is thrown, or the status is 401, the flow will go down and authenticate again
                }
            }

            // Generate the url that will be used for the consent dialog and put the scope as sheets
            const authorizeUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: GSheetHandler.scopes, });

            // Open an http server to accept the oauth callback. In this simple example, the
            // only request to our webserver is to /oauth2callback?code=<code>
            if (GSheetHandler.httpAuthServer && GSheetHandler.httpAuthServer.listening) {
                GSheetHandler.httpAuthServer.close();
            }
            const onGetToken = async (token) => {
                const tokenResponse = await oAuth2Client.getToken(token);
                oAuth2Client.setCredentials(tokenResponse.tokens);
                this.ipcClient.send('gsheet_refresh_tokens', tokenResponse.tokens); // Save this token to login again
                resolve(oAuth2Client);
            }

            // The oauth token can be obtained either from btplink://
            ipcMain.on('oauth_token', async (event, args) => {
                const token = args[0];
                onGetToken(token);
            });
            // Or from a request to http://localhost:OAUTH_HTTP_PORT/oauth
            GSheetHandler.httpAuthServer = http.createServer(async (req, res) => {
                try {
                    const searchParams = new Url.URL(req.url!, `http://localhost:${Config.OAUTH_HTTP_PORT}`).searchParams;
                    if (req.url!.indexOf('/oauth') > -1) {
                        const token = searchParams.get('code');
                        if (token) {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(`Ok`);
                            GSheetHandler.httpAuthServer.close();
                            onGetToken(token);
                            return;
                        }
                    }
                    const error = searchParams.get('error');
                    res.end('Error: ' + error + '\n\nIf persists please contact ' + Config.EMAIL_SUPPORT);
                    GSheetHandler.httpAuthServer.close();
                    reject();
                } catch (e) {
                    res.end('Error: ' + e + '\n\nIf persists please contact ' + Config.EMAIL_SUPPORT);
                    GSheetHandler.httpAuthServer.close();
                    reject(e);
                }
            });
            try { GSheetHandler.httpAuthServer.listen(Config.OAUTH_HTTP_PORT, () => { }); } catch { }
            shell.openExternal(authorizeUrl);
        });
    }

    onWsMessage(ws: WebSocket, message: any, req: http.IncomingMessage): Promise<any> {
        throw new Error('Method not implemented.');
    }

    onWsClose(ws: WebSocket) {
        throw new Error('Method not implemented.');
    }

    onWsError(ws: WebSocket, err: Error) {
        throw new Error('Method not implemented.');
    }

    setIpcClient(ipcClient) {
        this.ipcClient = ipcClient;
    }

    static getInstance() {
        if (!GSheetHandler.instance) {
            GSheetHandler.instance = new GSheetHandler();
        }
        return GSheetHandler.instance;
    }
}
