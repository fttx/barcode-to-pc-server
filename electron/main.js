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
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

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

let ipcMain = electron.ipcMain;
let sender;
ipcMain.on('connect', (event, arg) => {
  sender = event.sender;
  console.log("client connected")
})


setTimeout(() => {
  sender.send('message', "FINALMENTE")
  console.log("message sent");
}, 5000)


console.log("TEST")


var express = require('express')();
var ws = require('express-ws')(express);
var robot = require("robotjs");
var bonjour = require('bonjour')();

var port = 57891;

bonjour.publish({ name: 'Barcode to PC server', type: 'http', port: port })

express.ws('/', (ws, req) => {
  console.log("incoming connection");
  ws.send('Hello! from server!', () => { });
  ws.on('message', (message) => {
    message = JSON.parse(message);
    sender.send(message.action, message.data)
    console.log("FROM APP: ", message)
    switch (message.action) {
      case 'scan':
        robot.typeString(message.data.text);
        break;

      case 'scanSession':

        break;

      case 'scanSessions':

        break;
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