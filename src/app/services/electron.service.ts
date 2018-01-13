import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, remote, shell } from 'electron';
import { Storage } from './storage.service'


@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  dialog: typeof remote.dialog;
  app: typeof remote.app;
  shell: typeof shell;

  constructor(
    private storage: Storage
  ) {
    if (this.isElectron()) {
      let electron = window.require('electron');

      this.ipcRenderer = electron.ipcRenderer;
      this.dialog = electron.remote.dialog;
      this.app = electron.remote.app;
      this.shell = electron.shell;

      this.ipcRenderer.send('pageLoad'); // send the first message from the renderer
      this.ipcRenderer.send('settings', this.storage.getSettings());
    }
  }

  isElectron() {
    return window && window.process && window.process.type;
  }

}