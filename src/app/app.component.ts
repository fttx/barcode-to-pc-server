import { Component } from '@angular/core';
import { ScanSessionModel } from './models/scan-session.model'
import { ScanSessionsService } from './services/scan-sessions.service'

declare var window: any;
//const electron = window.require('electron');

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {

    public scanSessions: ScanSessionModel[] = [];
    public selectedScanSession: ScanSessionModel;
    public animateLast = false;

    constructor(
        private scanSessionService: ScanSessionsService,

    ) { }

    ngOnInit() { }
}
