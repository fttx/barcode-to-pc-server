import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs'
import { ScanSessionModel } from '../models/scan-session.model'
import { ScanModel } from '../models/scan.model'

declare var window: any;
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

@Injectable()
export class ScanSessionsService {
    
    constructor(
        private ngZone: NgZone,
    ) {
        if (!ipcRenderer) return;
        ipcRenderer.send('connect');
    }

    onScan(): Observable<ScanSessionModel> {
        return Observable.create(observer => {
            if (!ipcRenderer) return;
            ipcRenderer.on('putScan', (event, scanSession) => {
                this.ngZone.run(() => observer.next(scanSession))
            });
        });
    }

    onScanSessions(): Observable<ScanSessionModel[]> {
        return Observable.create(observer => {
            if (!ipcRenderer) return;
            ipcRenderer.on('putScanSessions', (event, data) => {
                this.ngZone.run(() => observer.next(data))
            });
        });
    }
}
