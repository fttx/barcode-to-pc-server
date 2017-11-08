import { Injectable } from '@angular/core';
import { ScanSessionModel } from '../models/scan-session.model'
import { ScanModel } from '../models/scan.model'
import { SettingsModel } from '../models/settings.model'

@Injectable()
export class Storage {
    private static SCAN_SESSIONS = "scan_sessions";
    private static SETTINGS = "settings";
    private static EVER_CONNECTED = "ever_connected";
    private static LAST_SCAN_DATE = "last_scan_date";

    _scanSessions: ScanSessionModel[] = [];
    _settings: SettingsModel = new SettingsModel();
    _everConnected: boolean = false;

    constructor(
    ) { }

    get scanSessions(): ScanSessionModel[] {
        let ss = JSON.parse(localStorage.getItem(Storage.SCAN_SESSIONS));
        if (ss) {
            this._scanSessions = ss;
        }
        return this._scanSessions;
    }

    set scanSessions(scanSessions: ScanSessionModel[]) {
        localStorage.setItem(Storage.SCAN_SESSIONS, JSON.stringify(scanSessions));
        this._scanSessions = scanSessions;
    }


    get settings(): SettingsModel {
        let s = JSON.parse(localStorage.getItem(Storage.SETTINGS));
        if (s) {
            this._settings = s;
        }
        return this._settings;
    }

    set settings(settings: SettingsModel) {
        localStorage.setItem(Storage.SETTINGS, JSON.stringify(settings));
        this._settings = settings;
    }


    get everConnected(): boolean {
        let ec = JSON.parse(localStorage.getItem(Storage.EVER_CONNECTED));
        if (ec) {
            this._everConnected = ec;
        }
        return this._everConnected;
    }

    set everConnected(everConnected: boolean) {
        localStorage.setItem(Storage.EVER_CONNECTED, JSON.stringify(everConnected));
        this._everConnected = everConnected;
    }

    getLastScanDate(deviceId: string): number {
        let lsd = localStorage.getItem(Storage.LAST_SCAN_DATE + '_' + deviceId);
        console.log(lsd)
        if (!lsd) {
            return 0;
        }
        return JSON.parse(lsd);
    }

    setLastScanDate(deviceId: string, lastScanDate: number) {
        if (deviceId && lastScanDate) {
            localStorage.setItem(Storage.LAST_SCAN_DATE + '_' + deviceId, JSON.stringify(lastScanDate));            
        }
    }

}
