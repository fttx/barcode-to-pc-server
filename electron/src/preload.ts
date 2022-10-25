import { app, dialog, getCurrentWindow, process, systemPreferences } from "@electron/remote";
import { contextBridge, ipcRenderer, Menu, MenuItem, shell } from "electron";
import * as fs from 'fs';
import * as nodeMachineId from 'node-machine-id';
import * as os from 'os';
import * as path from 'path';
import { v4 } from 'uuid';

/**
 * In the newer versions of Electron window.require('native dependency') has
 * been removed (context-isolation, see:
 * https://www.electronjs.org/docs/latest/tutorial/context-isolation).
 *
 * To communicate between native modules accessible only by the main process
 * and the renderer process we use this intermediate preload.js file.
 *
 * It's executed before the renderer starts, and exposes new objects to the
 * window object.
 *
 * Example call from the renderer: window.preload.nativeDep()
 *
 * Nested methods inside the dependency module cannot be called, so it's
 * required a pass-through method (see below).
 *
 * Promises do not work. Use synchronous methods.
 */
contextBridge.exposeInMainWorld('preload', {
    ipcRenderer: {
        on(channel, listener) {
            return ipcRenderer.on(channel, listener);
        },
        send(channel, ...args) {
            return ipcRenderer.send(channel, args);
        },
        removeAllListeners(channel) {
            return ipcRenderer.removeAllListeners(channel);
        },
        removeListener(channel, listener) {
            return ipcRenderer.removeListener(channel, listener);
        },
    },
    showSaveDialogSync: (options) => {
        return dialog.showSaveDialogSync(getCurrentWindow(), options);
    },
    showMessageBoxSync: (options) => {
        return dialog.showMessageBoxSync(null, options);
    },
    showOpenDialogSync: (options) => {
        return dialog.showOpenDialogSync(getCurrentWindow(), options);
    },
    appGetVersion: app.getVersion,
    appGetLoginItemSettings: app.getLoginItemSettings,
    appSetLoginItemSettings: app.setLoginItemSettings,
    appGetPath: app.getPath,
    shell: shell,
    Menu: Menu,
    MenuItem: MenuItem,
    store: {
        get(key, defaultValue) {
            return ipcRenderer.sendSync('electron-store-get', key, defaultValue);
        },
        set(key, value) {
            ipcRenderer.send('electron-store-set', key, value);
        },
    },
    nodeMachineId: nodeMachineId,
    v4: v4,
    processPlatform: process.platform,
    processArgv: process.argv,
    path: path,
    systemPreferences: systemPreferences,
    systemPreferencesIsTrustedAccessibilityClient: systemPreferences.isTrustedAccessibilityClient,
    os: os,
    fsWriteFileSync: (path, data, options) => {
        return fs.writeFileSync(path, data, options);
    },
    fsReadFileSync: (path, options) => {
        return fs.readFileSync(path, options);
    },
})
