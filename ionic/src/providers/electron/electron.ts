import { Injectable } from '@angular/core';
import { ipcRenderer, remote, shell, Menu, MenuItem } from 'electron';
import ElectronStore from 'electron-store';

declare var window: any;
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.


/*
 https://electronjs.org/docs/api/remote
*/
@Injectable()
export class ElectronProvider {
  public uuid = '';

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
      } catch (error) {
        this.uuid = 'uuid-error'
        console.log("UUID error: ", error)
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

  isTrustedAccessibilityClient(prompt: boolean) {
    if (!this.isElectron() || process.platform !== "darwin") { // always pass TRUE if the platform is not macOS
      return true;
    }
    return this.remote.systemPreferences.isTrustedAccessibilityClient(false);
  }

}
