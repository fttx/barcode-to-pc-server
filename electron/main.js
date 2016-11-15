const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 950, height: 660,
    minWidth: 950, minHeight: 660
  })

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
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
var express = require('express')();
var ws = require('express-ws')(express);
var robot = require("robotjs");
var bonjour = require('bonjour')();
let ipcMain = electron.ipcMain;

var port = 57891;
let ipcClient;
var settings;

ipcMain
  .on('connect', (event, arg) => {
    ipcClient = event.sender;
  }).on('sendSettings', (event, arg)  => {
    settings = arg;
  });

bonjour.publish({ name: 'Barcode to PC server', type: 'http', port: port })

express.ws('/', (ws, req) => {
  console.log("incoming connection");

  ws.on('message', (message) => {
    console.log("message: ", message)
    message = JSON.parse(message);
    ipcClient.send(message.action, message.data);
    if (message.action == 'putScan') {
      console.log(settings.enableRealtimeStrokes)
      if (settings.enableRealtimeStrokes) {
        robot.typeString(message.data.scannings[0].text);
        if (settings.endCharacter) {
          robot.keyTap(settings.endCharacter);
        }
      }
    }
  });

  ws.on('close', function close() {
    console.log('disconnected');
  });

  ws.on('error', function close() {
    console.log('error');
  });

});
express.listen(port, () => { });