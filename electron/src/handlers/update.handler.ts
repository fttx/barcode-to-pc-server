import { ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as http from 'http';
import * as WebSocket from 'ws';
import { SettingsModel } from '../../../ionic/src/models/settings.model';
import { Handler } from '../models/handler.model';
import { SettingsHandler } from './settings.handler';
import { UiHandler } from './ui.handler';
import ElectronStore = require('electron-store');

/**
 * MAIN PROCESS
 * 
 * This class is pretty much a pass through for the renderer process, in order
 * to communicate with the autoUpdater module that is available only in the main process.
 * 
 * Every time that an update event occurs the main process sends the value of **updateStatus** 
 * to the renderer.
 * 
 * When the user wants to update the app the renderer sends to the main process the message
 * 'checkForUpdates' or 'quitAndInstall'
 */
export class UpdateHandler implements Handler {
    // the same variable can be found in the info.ts page of the renderer process
    public updateStatus: ('checkingForUpdate' | 'updateAvailable' | 'updateNotAvailable' | 'updateError' | 'updateDownloaded') = 'updateNotAvailable';

    private static instance: UpdateHandler;
    private ipcClient;
    private autoUpdate;

    private constructor(
        public uiHandler: UiHandler,
        public settingsHandler: SettingsHandler,
    ) {
        autoUpdater.on('checking-for-update', () => {
            this.setAndSendUpdateStatusToRenderer('checkingForUpdate')
            console.log('Checking for update...');
        })
        autoUpdater.on('update-available', (info) => {
            this.setAndSendUpdateStatusToRenderer('updateAvailable')
            console.log('Update available.');
        })
        autoUpdater.on('update-not-available', (info) => {
            this.setAndSendUpdateStatusToRenderer('updateNotAvailable')
            console.log('Update not available.');
        })
        autoUpdater.on('error', (err) => {
            this.setAndSendUpdateStatusToRenderer('updateError')
            console.log('Error in auto-updater. ' + err);
        })
        autoUpdater.on('update-downloaded', (info) => {
            this.setAndSendUpdateStatusToRenderer('updateDownloaded')
            console.log('Update downloaded');
        });

        ipcMain.on('checkForUpdates', () => autoUpdater.checkForUpdates());
        ipcMain.on('quitAndInstall', () => {
            uiHandler.quitImmediately = true;
            autoUpdater.quitAndInstall()
        });
        ipcMain.on('downloadUpdate', () => {
            autoUpdater.downloadUpdate();
        });

        // since it's a ReplaySubject it's guaranted that i'll be executed at least once
        settingsHandler.onSettingsChanged.subscribe((settings: SettingsModel) => {
            if (this.autoUpdate != this.settingsHandler.autoUpdate) {
                this.autoUpdate = this.settingsHandler.autoUpdate;
                this.doUpdate();
            }
        });
    }

    private setAndSendUpdateStatusToRenderer(status) {
        this.updateStatus = status;
        this.ipcClient.send('onUpdateStatusChange', status);
    }

    static getInstance(uiHandler: UiHandler, settingsHandler: SettingsHandler) {
        if (!UpdateHandler.instance) {
            UpdateHandler.instance = new UpdateHandler(uiHandler, settingsHandler);
        }
        return UpdateHandler.instance;
    }

    doUpdate() {
        if (this.autoUpdate) {
            autoUpdater.autoDownload = true;
            autoUpdater.autoInstallOnAppQuit = true;
            autoUpdater.checkForUpdates().then(result => {
                console.log('Autoupdater:', result)
            });
        } else {
            autoUpdater.autoDownload = false;
            autoUpdater.autoInstallOnAppQuit = false;
        }
    }

    onWsMessage(ws: WebSocket, message: any, req: http.IncomingMessage) {
        throw new Error("Method not implemented.");
    }
    onWsClose(ws: WebSocket) {
        throw new Error("Method not implemented.");
    }
    onWsError(ws: WebSocket, err: Error) {
        throw new Error("Method not implemented.");
    }

    setIpcClient(ipcClient) {
        this.ipcClient = ipcClient;
    }
}