import { Injectable } from '@angular/core';
import { ScanSessionModel } from '../models/scan-session.model'
import { ScanModel } from '../models/scan.model'
import { LocalStorageService } from 'angular-2-local-storage';

declare var window: any;
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

@Injectable()
export class ScanSessionsStorage {
    private static SCAN_SESSIONS = "scan_sessions";

    constructor(
        private storage: LocalStorageService,
    ) { }

    setScanSessions(scanSessions: ScanSessionModel[]) {
        return this.storage.set(ScanSessionsStorage.SCAN_SESSIONS, JSON.stringify(scanSessions));
    }

    // TODO provare get<ScanSessionModel[]> forse c'è la tipizzazione integrata su localstorage
    getScanSessions(): Promise<ScanSessionModel[]> {
        return new Promise((resolve, reject) => {
            let data = this.storage.get<string>(ScanSessionsStorage.SCAN_SESSIONS);
            if (data != null) {
                let json = JSON.parse(data);
                let result = json.map(x => {
                    let scanSession: ScanSessionModel = {
                        id: x.id,
                        name: x.name,
                        date: new Date(x.date),
                        scannings: x.scannings
                    }
                    return scanSession;
                });
                resolve(result)
            } else {
                resolve([])
            }
        });

    }

}
