const electron = require('electron');
const { dialog, shell } = require('electron');
const express = require('express')();
const ws = require('express-ws')(express);
const robot = require("robotjs");
const bonjour = require('bonjour')();
const os = require('os');
const network = require('network');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let wsConnection
let ipcMain = electron.ipcMain

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 950, height: 600,
        minWidth: 950, minHeight: 600
    })

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/app/index.html`)

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
        if (wsConnection) {
            wsConnection.close();
        }
        bonjour.unpublishAll(() => {
            //bonjour.destroy()
        });
    })
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// In main process.


var port = 57891;
let ipcClient;
var settings;

ipcMain
    .on('connect', (event, arg) => {
        ipcClient = event.sender;
    }).on('sendSettings', (event, arg) => {
        settings = arg;
    }).on('getAddresses', (event, arg) => {
        network.get_interfaces_list((err, networkInterfaces) => {
            let addresses = [];

            for (let key in networkInterfaces) {
                let ip = networkInterfaces[key].ip_address;
                if (ip) {
                    addresses.push(ip);
                }
            };

            ipcClient.send('getAddresses', addresses);
        });
    }).on('getDefaultAddress', (event, arg) => {
        network.get_private_ip((err, ip) => {
            ipcClient.send('getDefaultAddress', ip);
        });
    }).on('getHostname', (event, arg) => {
        ipcClient.send('getHostname', os.hostname());
    });

var bonjourService = bonjour.publish({ name: 'Barcode to PC server - ' + getNumber(), type: 'http', port: port })

bonjourService.on('error', err => { // err is never set?
    dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Error',
        message: 'Another instance of Barcode To PC is already running.'
    }, response => {
        app.quit();
    });
});



express.ws('/', (ws, req) => {
    wsConnection = ws;

    console.log("incoming connection");
    ipcClient.send('onClientConnect', '');

    ws.on('message', (message) => {
        if (!mainWindow) return;
        message = JSON.parse(message);
        ipcClient.send(message.action, message.data);
        if (message.action == 'putScan') {
            if (settings.enableRealtimeStrokes) {
                robot.typeString(message.data.scannings[0].text);
                if (settings.endCharacter) {
                    robot.keyTap(settings.endCharacter);
                }
            }

            if (settings.enableOpenInBrowser) {
                shell.openExternal(message.data.scannings[0].text);
            }
        } else if (message.action == 'getVersion') {
            let message = { "action": "getVersion", "data": { "version": app.getVersion() } };
            ws.send(JSON.stringify(message));
        }
    });

    ws.on('close', function close() {
        console.log('disconnected');
    });

    ws.on('error', function close() {
        console.log('error');
    });

});


function getNumber() {
    let hostname = os.hostname();
    let result = '';
    for (let i = 0; i < hostname.length; i++) {
        result += hostname[i].charCodeAt(0);
    }
    return result.substring(0, 10);
}

express.listen(port, () => { });