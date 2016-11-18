import { Injectable } from '@angular/core';
import { ScanSessionModel } from '../models/scan-session.model'
import { ScanModel } from '../models/scan.model'
import { SettingsModel } from '../models/settings.model'
import { LocalStorageService } from 'angular-2-local-storage';

declare var window: any;
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

@Injectable()
export class Storage {
    private static SCAN_SESSIONS = "scan_sessions";
    private static SETTINGS = "settings";
    private static EVER_CONNECTED = "ever_connected";

    constructor(
        private storage: LocalStorageService,
    ) { }

    setScanSessions(scanSessions: ScanSessionModel[]) {
        return this.storage.set(Storage.SCAN_SESSIONS, scanSessions);
    }

    getScanSessions(): Promise<ScanSessionModel[]> {
        return new Promise((resolve, reject) => {
            let data = this.storage.get<ScanSessionModel>(Storage.SCAN_SESSIONS);
            resolve(data);
        });
    }

    setSettings(settings: SettingsModel) {
        return this.storage.set(Storage.SETTINGS, settings);
    }

    getSettings(): Promise<SettingsModel> {
        return new Promise((resolve, reject) => {
            let data = this.storage.get<SettingsModel>(Storage.SETTINGS);
            resolve(data);
        });
    }

    setEverConnected(everConnected: boolean) {
        return this.storage.set(Storage.EVER_CONNECTED, everConnected);
    }

    getEverConnected(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let data = this.storage.get<boolean>(Storage.EVER_CONNECTED);
            resolve(data);
        });
    }


}
