import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs'
import { ScanSessionModel } from '../models/scan-session.model'
declare var window: any;
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

@Injectable()
export class ScanSessionsService {

    public scanSessions: ScanSessionModel[] = [];
    private scanSessionsObserver: Observable<ScanSessionModel[]>;

    constructor(
        private ngZone: NgZone,
    ) {
        if (ipcRenderer) {
            ipcRenderer.send('connect');
        }

        this.scanSessionsObserver = Observable.create(observer => {
            if (ipcRenderer) {
                ipcRenderer.on('scanSessions', (event, scanSessions) => {
                    ngZone.run(() => {
                        this.scanSessions = scanSessions;
                        observer.next(scanSessions);
                    })
                })
            } else {
                this.scanSessions = [{
                    name: 'Scan 0',
                    date: new Date(),
                    scannings: [{
                        text: 'sa8d654f5asf4',
                        format: 'ean'
                    }, {
                        text: 'g85ed484gh',
                        format: 'ean'
                    }, {
                        text: 'ae5tfg5esf',
                        format: 'ean'
                    }]
                },
                {
                    name: 'Scan 1',
                    date: new Date(),
                    scannings: [{
                        text: 'f651s5d1fsd1fsdfsdf',
                        format: 'ean'
                    }]
                },
                {
                    name: 'Scan 2',
                    date: new Date(),
                    scannings: [{
                        text: '0000101011',
                        format: 'ean'
                    }, {
                        text: '2345124534125341524',
                        format: 'ean'
                    }, {
                        text: 'asdasdasdasdasdasd',
                        format: 'ean'
                    }]
                }];
                observer.next(this.scanSessions);
            }
        });
    }

    getScanSessions(): Observable<ScanSessionModel[]> {
        //ipcRenderer.send('sync');

        return this.scanSessionsObserver;
    } // getScanSessions

    getScanSession(index): ScanSessionModel {
        if (this.scanSessions.length - 1 >= index) {
            return this.scanSessions[index];
        }
        return null;
    }
}
