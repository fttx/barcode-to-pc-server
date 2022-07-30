import { Injectable } from '@angular/core';
import * as v4 from 'uuid/v4';

declare var window: any;

@Injectable()
export class ElectronProvider {
  public uuid = 'default-uuid';

  ipcRenderer: any;
  showSaveDialogSync: any;
  showMessageBoxSync: any;
  showOpenDialogSync: any;
  appGetVersion: any;
  shell: any;
  menu: any;
  menuItem: any;
  store: any;
  nodeMachineId: any;
  v4: any;
  processArgv: any;
  fsWriteFileSync: any;
  fsReadFileSync: any;
  path: any;
  systemPreferences: any;
  systemPreferencesIsTrustedAccessibilityClient: any;
  os: any;
  appGetLoginItemSettings: any;
  appSetLoginItemSettings: any;
  appGetPath: any;
  processPlatform: any;

  constructor(
  ) {
    if (ElectronProvider.isElectron()) {
      // preload
      this.showSaveDialogSync = window.preload.showSaveDialogSync;
      this.showMessageBoxSync = window.preload.showMessageBoxSync;
      this.showOpenDialogSync = window.preload.showOpenDialogSync;
      this.shell = window.preload.shell;
      this.menu = window.preload.Menu;
      this.menuItem = window.preload.MenuItem;
      this.ipcRenderer = window.preload.ipcRenderer;
      this.store = window.preload.store;
      this.nodeMachineId = window.preload.nodeMachineId;
      this.processArgv = window.preload.processArgv;
      this.fsWriteFileSync = window.preload.fsWriteFileSync;
      this.fsReadFileSync = window.preload.fsReadFileSync;
      this.path = window.preload.path;
      this.systemPreferences = window.preload.systemPreferences;
      this.systemPreferencesIsTrustedAccessibilityClient = window.preload.systemPreferencesIsTrustedAccessibilityClient;
      this.os = window.preload.os;
      this.appGetVersion = window.preload.appGetVersion;
      this.appGetLoginItemSettings = window.preload.appGetLoginItemSettings;
      this.appSetLoginItemSettings = window.preload.appSetLoginItemSettings;
      this.appGetPath = window.preload.appGetPath;
      this.processPlatform = window.preload.processPlatform;

      // Duplicated code on the settings.handler.ts file
      try {
        this.uuid = this.nodeMachineId.machineIdSync();
      } catch {
        // Generate a one-time random UUID and save it
        let uuid = this.store.get('uuid', null);
        if (uuid == null) {
          this.v4 = window.preload.v4;
          this.uuid = v4();
          this.store.set('uuid', this.uuid);
        } else {
          this.uuid = uuid;
        }
      }
    } else {
      this.store = {};
      this.store.get = function (key, defaultValue) {
        return JSON.parse(window.localStorage.getItem(key)) || defaultValue;
      }

      this.store.set = function (key, value) {
        return window.localStorage.setItem(key, JSON.stringify(value));
      }

      this.appGetVersion = function () { return '0.0.0' };
      this.processArgv = '';
      this.ipcRenderer = { on: (channel, listener) => { }, send: (channel, ...args) => { } };
    }
  }

  sendReadyToMainProcess() {
    if (ElectronProvider.isElectron()) {
      this.ipcRenderer.send('pageLoad'); // send the first message from the renderer
      this.ipcRenderer.send('settings');
    }
  }

  public static isElectron() {
    return window.preload;
  }

  isDev() {
    return !ElectronProvider.isElectron() || (this.processArgv && this.processArgv.indexOf('--dev') != -1);
  }

  // Always returns true if the platform is not macOS
  checkAndOpenAccessibilitySettigns(prompt: boolean) {
    if (!ElectronProvider.isElectron() || this.processPlatform !== "darwin") {
      return true;
    }
    return this.systemPreferencesIsTrustedAccessibilityClient(prompt);
  }

  getPlatform() {
    return this.processPlatform;
  }
}
