import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';

import * as robotjs from 'robotjs'
import * as network from 'network';
import * as os from 'os';
import * as path from 'path';

import * as WebSocket from 'ws';
const PORT = 57891;
let wss;
import * as b from 'bonjour'
import { requestModelDeleteScanSession, requestModelPutScanSession, requestModelSetScanSessions, requestModelPutScan, requestModel, requestModelHelo } from './src/app/models/request.model';
import { responseModelHelo, responseModelPong, responseModelPutScanAck } from './src/app/models/response.model';
import { StringComponentModel } from './src/app/models/string-component.model';
import { SettingsModel } from './src/app/models/settings.model';
const bonjour = b();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let mdnsAd;
let developmentMode = process.argv.slice(1).some(val => val === '--dev');

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024, height: 720,
        minWidth: 800, minHeight: 600
    })

    if (developmentMode) {
        mainWindow.webContents.on('did-fail-load', () => {
            setTimeout(() => mainWindow.reload(), 2000);
        })
        mainWindow.loadURL('http://localhost:4200');
        mainWindow.webContents.openDevTools();
    } else {
        // and load the index.html of the app.
        mainWindow.loadURL('file://' + __dirname + '/index.html');
    }

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
        // wss.clients.forEach(client => {
        //     // if (client.readyState === WebSocket.OPEN) {
        //     client.close();
        //     // }
        // });
        if (wss) {
            wss.close();
        }
        bonjour.unpublishAll(() => {
            //bonjour.destroy()
        });

        if (mdnsAd) {
            mdnsAd.stop();
        }
        // app.quit(); 
    })
    const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })

    if (isSecondInstance) {
        app.quit()
    }
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

if (app.setAboutPanelOptions) {
    app.setAboutPanelOptions({
        applicationName: 'Barcode to PC',
        applicationVersion: app.getVersion(),
        credits: 'Filippo Tortomasi',
    });
}

// let platform = os.platform() + '_' + os.arch();
// let version = app.getVersion();
// autoUpdater.setFeedURL('http://download.barcodetopc.com:20126/update/' + platform + '/' + version);
// autoUpdater.checkForUpdates()



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// In main process.

let ipcClient;
var settings: SettingsModel;

ipcMain
    .on('ready', (event, arg) => { // the renderer will send a 'ready' message once the angular finished loading
        ipcClient = event.sender; // save the renderer reference. TODO: what if there are more windows?
        onReady();
    }).on('settings', (event, arg) => {
        settings = arg;
    }).on('getLocalAddresses', (event, arg) => {
        network.get_interfaces_list((err, networkInterfaces) => {
            let addresses = [];

            for (let key in networkInterfaces) {
                let ip = networkInterfaces[key].ip_address;
                if (ip) {
                    addresses.push(ip);
                }
            };
            ipcClient.send('localAddresses', addresses);
        });
    }).on('getDefaultLocalAddress', (event, arg) => {
        network.get_private_ip((err, ip) => {
            ipcClient.send('defaultLocalAddress', ip);
        });
    }).on('getHostname', (event, arg) => {
        ipcClient.send('hostname', os.hostname());
    });


function onReady() {
    wss = new WebSocket.Server({ port: PORT });

    try {
        var mdns = require('mdns');

        mdnsAd = mdns.createAdvertisement(mdns.tcp('http'), PORT, {
            name: 'Barcode to PC server - ' + getNumber()
        });
        mdnsAd.start();
    } catch (ex) {
        dialog.showMessageBox(mainWindow, {
            type: 'warning',
            title: 'Error',
            message: 'Apple Bonjour is missing.\nThe app may fail to detect automatically the server.\n\nTo remove this alert try to install Barcode to PC server again with an administrator account and reboot your system.',
        });

        var bonjourService = bonjour.publish({ name: 'Barcode to PC server - ' + getNumber(), type: 'http', port: PORT })

        bonjourService.on('error', err => { // err is never set?
            dialog.showMessageBox(mainWindow, {
                type: 'error',
                title: 'Error',
                message: 'An error occured while announcing the server.'
            });
        });
    }


    wss.on('connection', (ws, req) => {
        console.log("ws(incoming connection)")

        let deviceName = "unknown";
        // const clientAddress = req.connection.remoteAddress;
        ipcClient.send('clientConnected', '');

        ws.on('message', messageData => {
            console.log('ws(message): ', messageData)
            if (!mainWindow || !ipcClient) return;
            let obj = JSON.parse(messageData.toString());

            switch (obj.action) {
                case requestModel.ACTION_PUT_SCAN: {

                    let request: requestModelPutScan = obj;
                    let barcode = request.scan.text;

                    if (settings.enableRealtimeStrokes) {
                        settings.typedString.forEach((stringComponent: StringComponentModel) => {
                            switch (stringComponent.type) {
                                case 'barcode': {
                                    robotjs.typeString(barcode);
                                    break;
                                }
                                case 'text': {
                                    robotjs.typeString(stringComponent.value);
                                    break;
                                }
                                case 'key': {
                                    robotjs.keyTap(stringComponent.value);
                                    break;
                                }
                                case 'variable': {
                                    robotjs.typeString(eval(stringComponent.value));
                                    break;
                                }
                                case 'function': {
                                    // do checks to prevent injections
                                    robotjs.typeString(eval(barcode));
                                    break;
                                }
                            }
                        });
                    }

                    if (settings.enableOpenInBrowser) {
                        shell.openExternal(barcode);
                    }

                    // ACK
                    let response = new responseModelPutScanAck();
                    response.fromObject({
                        scanId: request.scan.id,
                        scanSessionId: request.scanSessionId
                    });
                    ws.send(JSON.stringify(response));
                    // END ACK

                    break;
                }

                case requestModel.ACTION_SET_SCAN_SESSIONS: {


                    break;
                }

                case requestModel.ACTION_PUT_SCAN_SESSION: {

                    break;
                }

                case requestModel.ACTION_DELETE_SCAN_SESSION: {

                    break;
                }

                case requestModel.ACTION_PING: {
                    ws.send(JSON.stringify(new responseModelPong()));
                    break;
                }


                case requestModel.ACTION_HELO: {
                    let request: requestModelHelo = obj;
                    let response = new responseModelHelo();
                    response.fromObject({
                        version: app.getVersion()
                    });

                    if (request && request.deviceName) {
                        deviceName = request.deviceName;
                    }
                    ws.send(JSON.stringify(response));
                    break;

                }

                case requestModel.ACTION_UPDATE_SCAN_SESSION: {

                    break;
                }

                default: {
                    // ipcClient.send(messageObj.action, messageObj.data);
                    console.log('unhandled ws action: ', obj.action, obj);
                    break;
                }
            }

            ipcClient.send(obj.action, obj);
        });

        ws.on('close', () => {
            console.log('ws(close)');
        });
    });

}

function getNumber() {
    let hostname = os.hostname();
    let result = '';
    for (let i = 0; i < hostname.length; i++) {
        result += hostname[i].charCodeAt(0);
    }
    return result.substring(0, 10);
}