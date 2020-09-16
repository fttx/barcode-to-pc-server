import { execFileSync } from 'child_process';
import { app, BrowserWindow, Menu, MenuItemConstructorOptions, nativeImage, systemPreferences, Tray } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as http from 'http';
import * as _path from 'path';
import * as WebSocket from 'ws';
import { Config } from '../config';
import { Handler } from '../models/handler.model';
import { SettingsHandler } from './settings.handler';


export class UiHandler implements Handler {
    public tray: Tray = null;
    // Keep a global reference of the window object, if you don't, the window
    // will be closed automatically when the JavaScript object is garbage
    // collected.
    public mainWindow: BrowserWindow;
    // Used to hold the server settings, shared between the main and renderer
    // process.
    // Warning: wait for the onSettingsChanged event before reading values!
    private settingsHandler: SettingsHandler;
    private ipcClient;
    /**
     * quitImmediately must be set to TRUE before calling app.quit().
     *
     * This variable is used to detect when the user clicks the **close button** of the window:
     * since the 'close' event may fire for various reasons, everytime that quitImmediately is set
     * to FALSE we can assume that the user has clicked the close button.
     */
    public quitImmediately = false;

    // Used to trigger the automatic window minimization only on the first launch
    static IsFirstInstanceLaunch = true;

    private static instance: UiHandler;
    private constructor(settingsHandler: SettingsHandler,) {
        if (!app.requestSingleInstanceLock()) {
            this.quitImmediately = true;
            app.quit();
            return;
        }
        app.on('second-instance', (event, argv, workingDirectory) => {
            // Send the second instance' argv value, so that it can grab the file
            // parameter, if there is one (.btpt)
            //
            // On macOS the file opening is handled differently, see the
            // main.ts>open-file event
            this.mainWindow.webContents.send('second-instance-open', argv)
            // Someone tried to run a second instance, we should focus the main window.
            this.bringWindowUp();
        })

        let canTriggerSettingsReadyCounter = 0;
        this.settingsHandler = settingsHandler;

        settingsHandler.onSettingsChanged.subscribe((settings) => {
            this.updateTray();
            canTriggerSettingsReadyCounter++;
            if (canTriggerSettingsReadyCounter == 2) this.onSettingsReady()
        });

        app.on('ready', () => { // This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs.
            this.createWindow();
            canTriggerSettingsReadyCounter++;
            if (canTriggerSettingsReadyCounter == 2) this.onSettingsReady()
        });

        app.on('window-all-closed', () => {  // Quit when all windows are closed.
            // if (process.platform !== 'darwin') { // On OS X it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q, but since Barcode to PC needs the browser windows to perform operation on the localStorage this is not allowed
            app.quit()
            // }
        })
        // app.on('activate', () => {
        //     if (this.mainWindow === null) { // On OS X it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open, but since the app will quit when there aren't active windows this event will never occour.
        //         this.createWindow()
        //     }
        // })
        app.setName(Config.APP_NAME);
        if (app.setAboutPanelOptions) {
            app.setAboutPanelOptions({
                applicationName: Config.APP_NAME,
                applicationVersion: app.getVersion(),
                credits: Config.AUTHOR,
            });
        }
        if (process.platform == 'darwin') {
            systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => { this.updateTray(true); })
        }
    }

    // Waits for the settings to be read and the 'ready' event to be sent
    public onSettingsReady() {
        this.autoMinimize();
    }

    static getInstance(settingsHandler: SettingsHandler) {
        if (!UiHandler.instance) {
            UiHandler.instance = new UiHandler(settingsHandler);
        }
        return UiHandler.instance;
    }

    private setMacOSTray() {
        let black = nativeImage.createFromPath(_path.join(__dirname, '/../assets/tray/macos/icon.png'));
        let white = nativeImage.createFromPath(_path.join(__dirname, '/../assets/tray/macos/iconHighlight.png'));
        // systemPreferences.isDarkMode() is not reilable with electron@4.0.3
        // For this reason we use an external executable to check the settings
        // See: https://github.com/fttx/read-darkmode
        let readDarkModeExecutable = _path.join(__dirname, '/../../../read-darkmode').replace('app.asar', 'app.asar.unpacked');
        let result = 'light';
        try { result = execFileSync(readDarkModeExecutable).toString().trim(); } catch { }
        if (result == 'dark') {
            if (this.tray == null) this.tray = new Tray(white);
            // Always update the icon image: we don't know if it's the first
            // time that setMacOSTray() is called.
            this.tray.setImage(white);
        } else {
            if (this.tray == null) this.tray = new Tray(black);
            this.tray.setImage(black);
        }
        this.tray.setPressedImage(white);
    }

    private updateTray(forceMacOSUpdate = false) {
        if (this.settingsHandler.enableTray) {
            if (forceMacOSUpdate) this.setMacOSTray();
            if (this.tray == null) {
                let menuItems: MenuItemConstructorOptions[] = [
                    // { label: 'Enable realtime ', type: 'radio', checked: false },
                    {
                        label: 'Exit', click: () => {
                            this.quitImmediately = true;
                            app.quit();
                        }
                    },
                ];
                if (process.platform == 'darwin') {
                    // macOS
                    this.setMacOSTray();
                    menuItems.unshift({ label: 'Hide', role: 'hide' });
                    menuItems.unshift({ label: 'Show', click: () => { this.bringWindowUp(); } });
                } else if (process.platform.indexOf('win') != -1) {
                    // Windows
                    this.tray = new Tray(nativeImage.createFromPath((_path.join(__dirname, '/../assets/tray/windows/icon.ico'))));
                } else {
                    // Linux
                    this.tray = new Tray(nativeImage.createFromPath((_path.join(__dirname, '/../assets/tray/default.png'))));
                    menuItems.unshift({ label: 'Hide', role: 'hide', click: () => { this.mainWindow.hide(); } });
                    menuItems.unshift({ label: 'Show', click: () => { this.bringWindowUp(); } });
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
            if (app.dock != null) {
                app.dock.show();
            }
        }
    }

    private autoMinimize() {
        if (!UiHandler.IsFirstInstanceLaunch) {
            return;
        }

        // macOS sets the wasOpenedAsHidden parameter based on the system settings
        if (process.platform === 'darwin' && app.getLoginItemSettings().wasOpenedAsHidden) {
            this.mainWindow.hide(); // corresponds to CMD+H, minimize() corresponds to clicking the yellow reduce to icon button
            if (this.settingsHandler.enableTray && app.dock != null) {
                app.dock.hide();
            }
        }

        // Windows and Linux do not have any minimization system settings, so
        // we have to read it from our settings
        if (process.platform !== 'darwin' && this.settingsHandler.openAutomatically == 'minimized') {
            if (this.settingsHandler.enableTray) {
                this.mainWindow.hide(); // removes the app from the taskbar
            } else {
                this.mainWindow.minimize(); // corresponds to clicking the reduce to icon button
            }
        }
        UiHandler.IsFirstInstanceLaunch = false;
    }

    private createWindow() {
        this.mainWindow = new BrowserWindow(Config.WINDOW_OPTIONS);
        if (Config.IS_DEV_MODE) {
            console.log('dev mode on')
            this.mainWindow.webContents.on('did-fail-load', () => {
                setTimeout(() => this.mainWindow.reload(), 2000);
            })
            this.mainWindow.loadURL('http://localhost:8200/');
            this.mainWindow.webContents.openDevTools();
            const log = require("electron-log")
            log.transports.file.level = "info"
            autoUpdater.logger = log
        } else if (Config.IS_TEST_MODE) {
            console.log('test mode on')
            this.mainWindow.webContents.on('did-fail-load', () => {
                setTimeout(() => this.mainWindow.reload(), 2000);
            })
            this.mainWindow.webContents.openDevTools();
            this.mainWindow.loadURL(_path.join('file://', __dirname, '../../../ionic/www/index.html'));
        } else {
            //console.log(__dirname) // /Users/filippo/Desktop/PROJECTS/barcode-to-pc-server-ionic/dist/electron/src/handlers
            this.mainWindow.loadURL(_path.join('file://', __dirname, '../../../ionic/www/index.html'));
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
                        {
                            label: 'Quit ' + Config.APP_NAME, click: (menuItem, browserWindow, event) => {
                                this.quitImmediately = true;
                                app.quit();
                            }
                        }
                    ]
                },
                {
                    label: 'Edit',
                    submenu: [
                        { role: "cut" },
                        { role: "copy" },
                        { role: "paste" },
                        { role: "selectAll" },
                        { type: 'separator' },
                        {
                            label: 'Find',
                            accelerator: process.platform === 'darwin' ? 'Cmd+F' : 'Ctrl+F',
                            click: () => {
                                this.ipcClient.send('find');
                            }
                        },
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

        this.mainWindow.on('close', (event) => { // occours when app.quit() is called or when the app is closed by the OS (eg. click close button)
            event.returnValue = true;
            if (this.quitImmediately) {
                return true;
            }

            // When the close button is clicked before the settings are loaded,
            // and thus the eventual trayIcon hasn't been created yet
            if (!this.settingsHandler) {
                return true;
            }

            if (this.settingsHandler.enableTray) {
                event.preventDefault();
                this.mainWindow.hide();
                if (app.dock != null) {
                    app.dock.hide();
                }
                event.returnValue = false
                return false;
            }
            return true;
        });

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

        if (this.mainWindow.isVisible()) {
            if (app.dock != null) {
                app.dock.show();
            }
        }

        const selectionMenu = Menu.buildFromTemplate([
            { role: 'copy' },
            { type: 'separator' },
            { role: 'selectall' },
        ]);

        const inputMenu = Menu.buildFromTemplate([
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { type: 'separator' },
            { role: 'selectall' },
        ])

        this.mainWindow.webContents.on('context-menu', (e, props) => {
            const { selectionText, isEditable } = props;
            if (isEditable) {
                inputMenu.popup({ window: this.mainWindow });
            } else if (selectionText && selectionText.trim() !== '') {
                selectionMenu.popup({ window: this.mainWindow });
            }
        })
    }

    async onWsMessage(ws: WebSocket, message: any, req: http.IncomingMessage): Promise<any> {
        throw new Error("Method not implemented.");
        return message;
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
