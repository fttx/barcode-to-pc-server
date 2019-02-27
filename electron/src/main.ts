import { app, ipcMain } from 'electron';
import * as WebSocket from 'ws';
import { Config } from './config';
import { ConnectionHandler } from './handlers/connection.handler';
import { ScansHandler } from './handlers/scans.handler';
import { SettingsHandler } from './handlers/settings.handler';
import { UiHandler } from './handlers/ui.handler';
import { UpdateHandler } from './handlers/update.handler';


let wss = null;
const settingsHandler = SettingsHandler.getInstance();
const uiHandler = UiHandler.getInstance(settingsHandler);
const scansHandler = ScansHandler.getInstance(settingsHandler, uiHandler);
const connectionHandler = ConnectionHandler.getInstance(uiHandler, settingsHandler);
const updateHandler = UpdateHandler.getInstance(uiHandler, settingsHandler);

ipcMain
    .on('pageLoad', (event, arg) => { // the renderer will send a 'pageLoad' message once the index.html document is loaded. (implies that the mainWindow exists)       
        if (wss != null || event.sender == null) {
            return;
        }

        let ipcClient = event.sender;

        wss = new WebSocket.Server({ port: Config.PORT });
        connectionHandler.announceServer();
        // TODO: get rid of setIpcClients, they generate unknown of unknowns
        connectionHandler.setIpcClient(ipcClient);
        uiHandler.setIpcClient(ipcClient);
        updateHandler.setIpcClient(ipcClient);

        // wss events should be registered immediately
        wss.on('connection', (ws, req) => {
            console.log("ws(incoming connection)", req.connection.remoteAddress)
            // const clientAddress = req.connection.remoteAddress;

            ws.on('message', message => {
                console.log('ws(message): ', message)
                // TODO: da sempre false, perchè?
                // è necessario questo controllo?
                if (!uiHandler.mainWindow) {
                    return;
                }

                let messageObj = JSON.parse(message.toString());

                scansHandler.onWsMessage(ws, messageObj);
                connectionHandler.onWsMessage(ws, messageObj);

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

function closeServer() {
    console.log('closing server')
    if (wss) {
        wss.close();
        wss = null;
        connectionHandler.removeServerAnnounce();
    }
}