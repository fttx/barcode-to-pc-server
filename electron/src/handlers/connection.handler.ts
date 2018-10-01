import * as b from 'bonjour';
import { app, dialog, ipcMain } from 'electron';
import ElectronStore = require('electron-store');
import * as mdns from 'mdns';
import * as network from 'network';
import * as os from 'os';
import * as WebSocket from 'ws';

import { requestModel, requestModelHelo } from '../../../ionic/src/models/request.model';
import { responseModelEnableQuantity, responseModelHelo, responseModelPong, responseModelKick } from '../../../ionic/src/models/response.model';
import { SettingsModel } from '../../../ionic/src/models/settings.model';
import { Config } from '../config';
import { Handler } from '../models/handler.model';
import { SettingsHandler } from './settings.handler';
import { UiHandler } from './ui.handler';

const bonjour = b();

export class ConnectionHandler implements Handler {
    public static EVENT_CODE_KICKED_OUT = 4001; // Used when the server kicks out a client

    private fallBackBonjour: b.Service;
    private mdnsAd: mdns.Advertisement;
    private wsClients = {};
    private ipcClient;

    private static instance: ConnectionHandler;

    constructor(
        public uiHandler: UiHandler,
        public settingsHandler: SettingsHandler
    ) {
        this.uiHandler = uiHandler;
        ipcMain
            .on('getLocalAddresses', (event, arg) => {
                network.get_interfaces_list((err, networkInterfaces) => {
                    let addresses = [];

                    for (let key in networkInterfaces) {
                        let ip = networkInterfaces[key].ip_address;
                        if (ip) {
                            addresses.push(ip);
                        }
                    };
                    event.sender.send('localAddresses', addresses);
                });
            }).on('getDefaultLocalAddress', (event, arg) => {
                network.get_private_ip((err, ip) => {
                    event.sender.send('defaultLocalAddress', ip);
                });
            }).on('getHostname', (event, arg) => {
                event.sender.send('hostname', os.hostname());
            }).on('kick', (event, deviceId) => {
                console.log('@Kick', deviceId)
                if (deviceId in this.wsClients) {
                    this.wsClients[deviceId].send(JSON.stringify(new responseModelKick()));
                }
            })
        // send enableQuantity to already connected clients
        settingsHandler.onSettingsChanged.subscribe((settings: SettingsModel) => {
            for (let deviceId in this.wsClients) {
                let ws = this.wsClients[deviceId];
                ws.send(JSON.stringify(new responseModelEnableQuantity().fromObject({
                    enable: this.settingsHandler.quantityEnabled
                })));
            }
        });
    }

    static getInstance(uiHandler: UiHandler, settingsHandler: SettingsHandler) {
        if (!ConnectionHandler.instance) {
            ConnectionHandler.instance = new ConnectionHandler(uiHandler, settingsHandler);
        }
        return ConnectionHandler.instance;
    }

    announceServer() {
        try {
            this.mdnsAd = mdns.createAdvertisement(mdns.tcp('http'), Config.PORT);

            this.mdnsAd.start();
        } catch (ex) {
            console.log('node_mdns error, faillback to bonjour')
            dialog.showMessageBox(this.uiHandler.mainWindow, {
                type: 'warning',
                title: 'Error',
                message: 'Apple Bonjour is missing.\nThe app may fail to detect automatically the server.\n\nTo remove this alert try to install ' + Config.APP_NAME + ' again with an administrator account and reboot your system.',
            });
            this.fallBackBonjour = bonjour.publish({ name: Config.APP_NAME, type: 'http', port: Config.PORT })
            this.fallBackBonjour.on('error', err => { // err is never set?
                dialog.showMessageBox(this.uiHandler.mainWindow, {
                    type: 'error',
                    title: 'Error',
                    message: 'An error occured while announcing the server.'
                });
            });
        }
    }

    removeServerAnnounce() {
        if (this.fallBackBonjour) {
            bonjour.unpublishAll(() => { })
        }

        if (this.mdnsAd) {
            this.mdnsAd.stop();
        }
    }

    onWsMessage(ws: WebSocket, message: any) {
        switch (message.action) {
            case requestModel.ACTION_PING: {
                ws.send(JSON.stringify(new responseModelPong()));
                break;
            }

            case requestModel.ACTION_HELO: {
                let request: requestModelHelo = message;
                let response = new responseModelHelo();
                response.fromObject({
                    version: app.getVersion(),
                    quantityEnabled: this.settingsHandler.quantityEnabled
                });

                if (request && request.deviceId) {
                    this.wsClients[request.deviceId] = ws;
                }
                ws.send(JSON.stringify(response));
                break;
            }
        }
    }

    onWsClose(ws: WebSocket) {
        if (this.ipcClient) {
            this.findDeviceIdByWs(ws).then(deviceId => {
                // console.log('@@@ close', deviceId)
                this.ipcClient.send('wsClose', { deviceId: deviceId })
            });
        }
        this.removeClient(ws);
    }

    onWsError(ws: WebSocket, err: Error) {
        if (this.ipcClient) {
            this.findDeviceIdByWs(ws).then(deviceId => {
                this.ipcClient.send('wsError', { deviceId: deviceId, err: err })
            });
        }
        this.removeClient(ws);
    }

    setIpcClient(ipcClient) {
        this.ipcClient = ipcClient;
    }

    private findDeviceIdByWs(ws) {
        return new Promise((resolve, reject) => {
            Object.keys(this.wsClients).forEach((key) => {
                if (this.wsClients[key] == ws) {
                    resolve(key);
                }
            });
        })
    }

    private removeClient(ws: WebSocket) {
        Object.keys(this.wsClients).forEach((key) => {
            delete this.wsClients[key];
        });
    }
}

