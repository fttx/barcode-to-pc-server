import { settings } from 'cluster';
import { app, BrowserWindow, Menu, MenuItemConstructorOptions, nativeImage, Tray } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as WebSocket from 'ws';
import * as _path from 'path';

import { Config } from '../config';
import { Handler } from '../models/handler.model';
import { SettingsHandler } from './settings.handler';

export class UiHandler implements Handler {
    public tray: Tray = null;
    public mainWindow: BrowserWindow; // Keep a global reference of the window object, if you don't, the window will be closed automatically when the JavaScript object is garbage collected.
    private settingsHandler: SettingsHandler;

    private static instance: UiHandler;
    private constructor(settingsHandler: SettingsHandler, ) {
        this.settingsHandler = settingsHandler;
        settingsHandler.onSettingsChanged.subscribe((settings) => {
            this.updateTray();
        });

        app.on('ready', () => {
            this.createWindow();
        }); // This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs.
        app.on('window-all-closed', () => {  // Quit when all windows are closed.            
            if (process.platform !== 'darwin') { // On OS X it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
                app.quit()
            }
        })
        app.on('activate', () => {
            if (this.mainWindow === null) { // On OS X it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
                this.createWindow()
            }
        })
        app.setName(Config.APP_NAME);
        if (app.setAboutPanelOptions) {
            app.setAboutPanelOptions({
                applicationName: Config.APP_NAME,
                applicationVersion: app.getVersion(),
                credits: Config.AUTHOR,
            });
        }
    }

    static getInstance(settingsHandler: SettingsHandler) {
        if (!UiHandler.instance) {
            UiHandler.instance = new UiHandler(settingsHandler);
        }
        return UiHandler.instance;
    }

    private updateTray() {
        if (this.settingsHandler.enableTray) {
            if (this.tray == null) {
                // console.log('creating tray')
                let menuItems: MenuItemConstructorOptions[] = [
                    // { label: 'Enable realtime ', type: 'radio', checked: false },        
                    { label: 'Exit', role: 'quit' },
                ];
                if (process.platform == 'darwin') {
                    this.tray = new Tray(nativeImage.createFromPath(_path.join(__dirname, '/../../assets/tray/macos/iconTemplate.png')));
                    this.tray.setPressedImage(nativeImage.createFromPath(_path.join(__dirname, '/../../assets/tray/macos/iconHighlight.png')));
                    menuItems.unshift({ label: 'Hide', role: 'hide' });
                    menuItems.unshift({
                        label: 'Show', click: () => {
                            this.bringWindowUp();
                        }
                    });
                } else if (process.platform.indexOf('win') != -1) {
                    this.tray = new Tray(nativeImage.createFromPath((_path.join(__dirname, '/../../assets/tray/windows/icon.ico'))));
                } else {
                    this.tray = new Tray(nativeImage.createFromPath((_path.join(__dirname, '/../../assets/tray/default.png'))));
                }

                this.tray.on('click', (event, bounds) => {
                    this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show()
                });
                const contextMenu = Menu.buildFromTemplate(menuItems);
                this.tray.setContextMenu(contextMenu); // https://github.com/electron/electron/blob/master/docs/api/tray.md
                this.tray.setToolTip(app.getName() + ' is running');
            }
        } else {
            if (this.tray != null) {
                this.tray.destroy();
                this.tray = null;
            }
        }
    }

    private bringWindowUp() {
        if (this.mainWindow) {
            if (this.mainWindow.isMinimized()) this.mainWindow.restore();
            this.mainWindow.show();
            this.mainWindow.focus();
        }
    }

    private createWindow() {
        this.mainWindow = new BrowserWindow(Config.WINDOW_OPTIONS);
        if (Config.IS_DEV_MODE) {
            console.log('dev mode on')
            this.mainWindow.webContents.on('did-fail-load', () => {
                setTimeout(() => this.mainWindow.reload(), 2000);
            })
            this.mainWindow.loadURL('http://localhost:4200');
            this.mainWindow.webContents.openDevTools();
            const log = require("electron-log")
            log.transports.file.level = "info"
            autoUpdater.logger = log
        } else {
            this.mainWindow.loadURL(_path.join('file://', __dirname, '/../../index.html'));
        }

        // Emitted when the window is closed.
        this.mainWindow.on('closed', () => {
            // Dereference the window object, usually you would store windows  in an array if your app supports multi windows, this is the time when you should delete the corresponding element.
            this.mainWindow = null
            // wss.clients.forEach(client => {
            //     // if (client.readyState === WebSocket.OPEN) {
            //     client.close();
            //     // }
            // });
            // app.quit();
        })

        const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
            this.bringWindowUp(); // Someone tried to run a second instance, we should focus our window.
        })

        if (isSecondInstance) {
            app.quit();
        }

        if (process.platform === 'darwin') {
            let template: MenuItemConstructorOptions[] = [
                {
                    label: Config.APP_NAME,
                    submenu: [
                        { role: 'about' },
                        { type: 'separator' },
                        { role: 'services', submenu: [] },
                        { type: 'separator' },
                        { role: 'hide' },
                        { role: 'hideothers' },
                        { role: 'unhide' },
                        { type: 'separator' },
                        { role: 'quit' }
                    ]
                },
                {
                    label: 'View',
                    submenu: [
                        { role: 'resetzoom' },
                        { role: 'zoomin' },
                        { role: 'zoomout' },
                        { type: 'separator' },
                        { role: 'togglefullscreen' }
                    ]
                },
                {
                    role: 'window',
                    submenu: [
                        { role: 'minimize' },
                        { role: 'close' },
                        { role: 'minimize' },
                        { role: 'zoom' },
                        { type: 'separator' },
                        { role: 'front' }
                    ]
                },
                {
                    role: 'help',
                    submenu: [
                        // {
                        //     label: 'Info',
                        //     click() { require('electron').shell.openExternal('https://electronjs.org') }
                        // }
                    ]
                }
            ]
            const menu = Menu.buildFromTemplate(template)
            Menu.setApplicationMenu(menu)
        }
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