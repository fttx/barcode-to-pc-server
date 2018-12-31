import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import ElectronStore from 'electron-store';
import { Config } from '../../../../electron/src/config';
import { ElectronProvider } from '../electron/electron';

/*
  Generated class for the UtilsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UtilsProvider {
  private store: ElectronStore;

  constructor(
    private electronProvider: ElectronProvider,
    public storage: Storage
  ) {
    this.store = new this.electronProvider.ElectronStore();
  }

  getQrCodeUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.electronProvider.isElectron()) {
        resolve(Config.URL_PAIR + '/?h=' + encodeURIComponent('DEBUG_HOSTNAME') + '&a=' + encodeURIComponent(['127.0.0.1', 'localhost'].join('-')));
        return;
      }

      Promise.all([this.getDefaultLocalAddress(), this.getHostname(), this.getLocalAddresses()]).then((results: any[]) => {
        let defaultLocalAddress = results[0];
        let hostname = results[1];
        let localAddresses = results[2];

        let index = localAddresses.indexOf(defaultLocalAddress);
        if (index > -1) { // removes the defaultLocalAddress from the localAddresses list
          localAddresses.splice(index, 1);
        }
        if (defaultLocalAddress) { // Adds the defaultLocalAddress at very beginning of the list
          localAddresses.unshift(defaultLocalAddress);
        }
        // this.ngZone.run(() => {
        resolve(Config.URL_PAIR + '/?h=' + encodeURIComponent(hostname) + '&a=' + encodeURIComponent(localAddresses.join('-')));
        // })
      });
    })
  }

  private getLocalAddresses(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.electronProvider.ipcRenderer.on('localAddresses', (e, localAddresses) => {
        resolve(localAddresses);
      });
      this.electronProvider.ipcRenderer.send('getLocalAddresses');
    })
  }


  private getDefaultLocalAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.electronProvider.ipcRenderer.on('defaultLocalAddress', (e, defaultLocalAddress) => {
        resolve(defaultLocalAddress);
      });
      this.electronProvider.ipcRenderer.send('getDefaultLocalAddress');
    })
  }


  private getHostname(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.electronProvider.ipcRenderer.on('hostname', (e, hostname) => {
        resolve(hostname);
      });
      this.electronProvider.ipcRenderer.send('getHostname');
    })
  }

  public static findIndexFromBottom<T>(array: ReadonlyArray<T>, predicate: (element: T, index: number) => boolean): number {
    for (let i = (array.length - 1); i >= 0; i--) {
      if (predicate(array[i], i)) {
        return i;
      }
    }
    return -1;
  }

  public showErrorNativeDialog(message: string = '') {
    this.electronProvider.dialog.showMessageBox(null, { // this.electronProvider.remote.getCurrentWindow()
      type: 'error', title: 'Error', buttons: ['Close'], message: message,
    })
  }


  public showSuccessNativeDialog(message: string = '') {
    this.electronProvider.dialog.showMessageBox(null, {
      type: 'info', title: 'Success', buttons: ['Close'], message: message
    })
  }

  public appendParametersToURL(url, data) {
    const ret = [];
    for (let d in data)
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return url + '?' + ret.join('&');
  }

  public upgradeIonicStoreToElectronStore() {
    const SCAN_SESSIONS = "scan_sessions";
    const SETTINGS = "settings";

    let scanSessions = JSON.parse(localStorage.getItem(SCAN_SESSIONS)) || [];
    if (scanSessions.length) {
      this.store.set(Config.STORAGE_SCAN_SESSIONS, scanSessions);
      localStorage.removeItem(SCAN_SESSIONS);
    }

    let settings = JSON.parse(localStorage.getItem(SETTINGS));
    if (settings != null) {
      this.store.set(Config.STORAGE_SETTINGS, settings);
      localStorage.removeItem(SETTINGS);
    }
  }
}
