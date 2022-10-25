import { app, ipcMain, ipcRenderer } from 'electron';
import * as WebSocket from 'ws';
import { Config } from './config';
import { ConnectionHandler } from './handlers/connection.handler';
import { ScansHandler } from './handlers/scans.handler';
import { SettingsHandler } from './handlers/settings.handler';
import { UiHandler } from './handlers/ui.handler';
import { GSheetHandler } from './handlers/gsheet.handler';
import { UpdateHandler } from './handlers/update.handler';
import * as http from 'http';
import ElectronStore = require('electron-store');
require('@electron/remote/main').initialize()

let wss = null;
const settingsHandler = SettingsHandler.getInstance();
const uiHandler = UiHandler.getInstance(settingsHandler);
const gsheetHandler = GSheetHandler.getInstance();
const scansHandler = ScansHandler.getInstance(settingsHandler, uiHandler, gsheetHandler);
const connectionHandler = ConnectionHandler.getInstance(uiHandler, settingsHandler);
const updateHandler = UpdateHandler.getInstance(uiHandler, settingsHandler);

let ipcClient: Electron.WebContents, lastArgv;

const store = new ElectronStore();
ipcMain.on('electron-store-get', async (event, key, defaultValue) => {
    event.returnValue = store.get(key, defaultValue);
});
ipcMain.on('electron-store-set', async (event, key, value) => {
    store.set(key, value);
});

ipcMain
    .on('pageLoad', (event) => { // the renderer will send a 'pageLoad' message once the index.html document is loaded. (implies that the mainWindow exists)
        if (wss != null || event.sender == null) {
            return;
        }

        ipcClient = event.sender;

        // The open-file event can be triggered before pageLoad event, so we
        // need to save the last argv value, so that we can send them to the
        // ionic project when the app finally loads. (macOS only)
        if (lastArgv) {
            ipcClient.send('second-instance-open', lastArgv);
            lastArgv = null;
        }

        wss = new WebSocket.Server({ port: Config.PORT });
        connectionHandler.announceServer();
        // TODO: get rid of setIpcClients, they generate unknown of unknowns
        connectionHandler.setIpcClient(ipcClient);
        uiHandler.setIpcClient(ipcClient);
        updateHandler.setIpcClient(ipcClient);
        scansHandler.setIpcClient(ipcClient);
        gsheetHandler.setIpcClient(ipcClient);

        // wss events should be registered immediately
        wss.on('connection', (ws, req: http.IncomingMessage) => {
            console.log("ws(incoming connection)", req.connection.remoteAddress)
            // const clientAddress = req.connection.remoteAddress;

            ws.on('message', async message => {
                console.log('ws(message): ', message)
                // TODO: da sempre false, perchè?
                // è necessario questo controllo?
                if (!uiHandler.mainWindow) {
                    return;
                }

                let messageObj = JSON.parse(message.toString());

                messageObj = await scansHandler.onWsMessage(ws, messageObj, req);
                messageObj = await connectionHandler.onWsMessage(ws, messageObj, req);

                ipcClient.send(messageObj.action, messageObj); // forward ws messages to ipc
            });

            ws.on('close', () => {
                console.log('ws(close)', req.connection.remoteAddress);
                connectionHandler.onWsClose(ws);
            });

            ws.on('error', (err) => {
                console.log('ws(error): ', err, req.connection.remoteAddress);
                connectionHandler.onWsError(ws, err);
            });
        });

        // app.on('before-quit', (event) => {
        //    closeServer();
        // })

        app.on('window-all-closed', () => { // TODO: test on windows
            closeServer();
            app.quit(); // TODO: keep the server running (this can't be done at the moment because the scannings are saved in the browserWindow localStorage)
        });
    })

// On macOS when you open an associated file (eg. btpt) electron emits
// the 'open-file' event.
// On Windows, instead, will be opened a second instance of the app, and
// it is handled on the ui.handler.ts file.
app.on('will-finish-launching', () => {
    app.on('open-file', (event, path) => {
        event.preventDefault();
        let argv = ['', path];
        lastArgv = argv;
        if (ipcClient) {
            ipcClient.send('second-instance-open', argv);
        }
    });
})

function closeServer() {
    console.log('closing server')
    if (wss) {
        wss.close();
        wss = null;
        connectionHandler.removeServerAnnounce();
    }
}
