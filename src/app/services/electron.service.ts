import { Injectable } from '@angular/core';

declare var window: any;
const shell = window.require ? window.require('electron').shell : null;
const dialog = window.require ? window.require('electron').remote.dialog : null;
const app = window.require ? window.require('electron').remote.app : null;

/**
 * This service is a temporary fix to window.require that interferes with angular-cli
 * This service is used to call electron functions from angular
 */
@Injectable()
export class Electron {

  constructor() { }

  openExternal(url: string) {
    if (!shell) return;
    shell.openExternal(url);
  }

  showMessageBox(options: any, callback: any) {
    if (!dialog) return;
    dialog.showMessageBox(options, callback);
  }

  getVersion(): string {
    if (!app) return;
    return app.getVersion();
  }
}
