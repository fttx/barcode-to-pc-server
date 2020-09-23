import { Injectable } from '@angular/core';
import { ipcRenderer, Menu, MenuItem, remote, shell } from 'electron';
import ElectronStore from 'electron-store';
import * as v4 from 'uuid/v4';

declare var window: any;
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.


/*
 https://electronjs.org/docs/api/remote
*/
@Injectable()
export class ElectronProvider {
  public uuid = 'default-uuid';

  ipcRenderer: typeof ipcRenderer;
  dialog: typeof remote.dialog;
  app: typeof remote.app;
  shell: typeof shell;
  process: typeof process;
  remote: typeof remote;
  menu: typeof Menu;
  menuItem: typeof MenuItem;
  ElectronStore: typeof ElectronStore;
  nodeMachineId;
  v4: typeof v4;
  windowManager: typeof windowManager;

  constructor(
  ) {
    // console.log('test')
    if (this.isElectron()) {
      let electron = window.require('electron');

      this.ipcRenderer = electron.ipcRenderer;
      this.dialog = electron.remote.dialog;
      this.app = electron.remote.app;
      this.shell = electron.shell;
      this.process = electron.remote.process;
      this.remote = electron.remote;
      this.menu = electron.remote.Menu;
      this.menuItem = electron.remote.MenuItem;
      this.ElectronStore = electron.remote.require('electron-store');
      this.nodeMachineId = electron.remote.require('node-machine-id');

      try {
        this.uuid = this.nodeMachineId.machineIdSync();
      } catch {
        // Generate a one-time random UUID and save it
        let store = new this.ElectronStore();
        let uuid = store.get('uuid', null);
        if (uuid == null) {
          this.v4 = electron.remote.require('uuid/v4');
          this.uuid = v4();
          store.set('uuid', this.uuid);
        } else {
          this.uuid = uuid;
        }
      }
    }
  }

  sendReadyToMainProcess() {
    if (this.isElectron()) {
      this.ipcRenderer.send('pageLoad'); // send the first message from the renderer
      this.ipcRenderer.send('settings');
    }
  }

  isElectron() {
    // console.log(process)
    return window.require; // && process.type;
  }

  isDev() {
    return !this.isElectron() || (this.process && this.process.argv.indexOf('--dev') != -1);
  }

  // Always returns true if the platform is not macOS
  checkAndOpenAccessibilitySettigns(prompt: boolean) {
    if (!this.isElectron() || this.process.platform !== "darwin") {
      return true;
    }
    return this.remote.systemPreferences.isTrustedAccessibilityClient(prompt);
  }

}
