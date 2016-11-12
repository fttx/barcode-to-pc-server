import { Component } from '@angular/core';
import { ScanSessionModel } from '../../models/scan-session.model'
import { ScanSessionsService } from '../../services/scan-sessions.service'

declare var window: any;
//const electron = window.require('electron');

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent {

    public scanSessions: ScanSessionModel[] = [];
    public selectedScanSession: ScanSessionModel;
    public animateLast = false;

    constructor(
        private scanSessionService: ScanSessionsService,
    ) { }

    ngOnInit() {
        this.scanSessionService.onScanSessions().subscribe(scanSessions => {
            this.scanSessions = scanSessions;
        });

        this.scanSessionService.onScan().subscribe(scanSession => {
            this.animateLast = true; setTimeout(() => this.animateLast = false, 500);

            let alredInIndex = this.scanSessions.findIndex(x => x.date.valueOf() == scanSession.date.valueOf());
            if (alredInIndex != -1) {
                this.scanSessions[alredInIndex].scannings.unshift(scanSession.scannings[0]);
                this.selectedScanSession = this.scanSessions[alredInIndex];
            } else {
                this.scanSessions.unshift(scanSession);
                this.selectedScanSession = this.scanSessions[0];
            }
        });
    }
}
