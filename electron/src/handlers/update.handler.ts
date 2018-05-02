import { autoUpdater } from 'electron-updater';
import * as WebSocket from 'ws';

import { Handler } from '../models/handler.model';

export class UpdateHandler implements Handler {

    private static instance: UpdateHandler;
    private constructor() {
        autoUpdater.on('checking-for-update', () => {
            console.log('Checking for update...');
        })
        autoUpdater.on('update-available', (info) => {
            console.log('Update available.');
        })
        autoUpdater.on('update-not-available', (info) => {
            console.log('Update not available.');
        })
        autoUpdater.on('error', (err) => {
            console.log('Error in auto-updater. ' + err);
        })
        autoUpdater.on('download-progress', (progressObj) => {
            let log_message = "Download speed: " + progressObj.bytesPerSecond;
            log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
            log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
            console.log(log_message);
        })
        autoUpdater.on('update-downloaded', (info) => {
            console.log('Update downloaded');
        });
    }

    static getInstance() {
        if (!UpdateHandler.instance) {
            UpdateHandler.instance = new UpdateHandler();
        }
        return UpdateHandler.instance;
    }

    checkUpdates() {
        autoUpdater.checkForUpdatesAndNotify().then(result => {
            console.log('Autoupdater:', result)
        });
    }

    onWsMessage(ws: WebSocket, message: any) {
        throw new Error("Method not implemented.");
    }
    onWsClose(ws: WebSocket) {
        throw new Error("Method not implemented.");
    }
    onWsError(ws: WebSocket, err: Error) {
        throw new Error("Method not implemented.");
    }

}