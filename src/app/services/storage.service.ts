import { Injectable } from '@angular/core';
import { ScanSessionModel } from '../models/scan-session.model'
import { ScanModel } from '../models/scan.model'
import { SettingsModel } from '../models/settings.model'
import { CoolLocalStorage } from 'angular2-cool-storage';

@Injectable()
export class Storage {
    private static SCAN_SESSIONS = "scan_sessions";
    private static SETTINGS = "settings";
    private static EVER_CONNECTED = "ever_connected";

    _scanSessions: ScanSessionModel[] = [];
    _settings: SettingsModel = new SettingsModel();
    _everConnected: boolean = false;

    constructor(
        private localStorage: CoolLocalStorage
    ) { }

    get scanSessions(): ScanSessionModel[] {
        let ss = JSON.parse(this.localStorage.getItem(Storage.SCAN_SESSIONS));
        if (ss) {
            this._scanSessions = ss;
        }
        return this._scanSessions;
    }

    set scanSessions(scanSessions: ScanSessionModel[]) {
        this.localStorage.setItem(Storage.SCAN_SESSIONS, JSON.stringify(scanSessions));
        this._scanSessions = scanSessions;
    }


    get settings(): SettingsModel {
        let s = JSON.parse(this.localStorage.getItem(Storage.SETTINGS));
        if (s) {
            this._settings = s;
        }
        return this._settings;
    }

    set settings(settings: SettingsModel) {
        this.localStorage.setItem(Storage.SETTINGS, JSON.stringify(settings));
        this._settings = settings;
    }


    get everConnected(): boolean {
        let ec = JSON.parse(this.localStorage.getItem(Storage.EVER_CONNECTED));
        if (ec) {
            this._everConnected = ec;
        }
        return this._everConnected;
    }

    set everConnected(everConnected: boolean) {
        this.localStorage.setItem(Storage.EVER_CONNECTED, JSON.stringify(everConnected));
        this._everConnected = everConnected;
    }

}
