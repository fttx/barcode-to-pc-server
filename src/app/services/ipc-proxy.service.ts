import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs'
import { ScanSessionModel } from '../models/scan-session.model'
import { ScanModel } from '../models/scan.model'
import { SettingsModel } from '../models/settings.model'
import { Storage } from './storage.service'

declare var window: any;
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

/**
 * This service is a temporary fix to window.require that interferes with angular-cli
 * This service is used to call electron.ipcRenderer functions from angular
 */
@Injectable()
export class IpcProxy {

    constructor(
        private ngZone: NgZone,
        private storage: Storage,
    ) {
        if (!ipcRenderer) return;
        ipcRenderer.send('connect');

        this.storage.getSettings().then(settings => {
            this.sendSettings(settings);
            console.log("settings sent")
        })
    }

    onClientConnect(): Observable<boolean> {
        return Observable.create(observer => {
            if (!ipcRenderer) return;
            ipcRenderer.on('onClientConnect', (event, scanSession) => {
                this.ngZone.run(() => observer.next(scanSession))
            });
        });
    }

    onPutScan(): Observable<ScanSessionModel> {
        return Observable.create(observer => {
            if (!ipcRenderer) return;
            ipcRenderer.on('putScan', (event, scanSession) => {
                this.ngZone.run(() => observer.next(scanSession))
            });
        });
    }

    onPutScanSessions(): Observable<ScanSessionModel[]> {
        return Observable.create(observer => {
            if (!ipcRenderer) return;
            ipcRenderer.on('putScanSessions', (event, data) => {
                this.ngZone.run(() => observer.next(data))
            });
        });
    }

    onDeleteScan() {
        return Observable.create(observer => {
            if (!ipcRenderer) return;
            ipcRenderer.on('deleteScan', (event, scanSession) => {
                this.ngZone.run(() => observer.next(scanSession))
            });
        });
    }

    onDeleteScanSessions() {
        return Observable.create(observer => {
            if (!ipcRenderer) return;
            ipcRenderer.on('deleteScanSession', (event, scanSession) => {
                this.ngZone.run(() => observer.next(scanSession))
            });
        });
    }

    sendSettings(settings: SettingsModel) {
        if (!ipcRenderer) return;
        ipcRenderer.send('sendSettings', settings);
    }

    getAddress() {
        if (!ipcRenderer) return;
        return ipcRenderer.sendSync('getAddress');
    }
}
