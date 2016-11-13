import { Component } from '@angular/core';
import { ScanSessionModel } from '../../models/scan-session.model'
import { ScanSessionsServer } from '../../services/scan-sessions-server.service'
import { ScanSessionsStorage } from '../../services/scan-sessions-storage.service'

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
        private scanSessionServer: ScanSessionsServer,
        private scanSessionStorage: ScanSessionsStorage,
    ) { }

    ngOnInit() {
        this.scanSessionStorage.getScanSessions().then(scanSessions => {
            if (this.scanSessions.length == 0) {
                this.scanSessions = scanSessions;
            }
        })

        this.scanSessionServer.onScanSessions().subscribe(scanSessions => {
            this.scanSessions = scanSessions;
            this.save();
        });

        this.scanSessionServer.onScan().subscribe(scanSession => {
            this.animateLast = true; setTimeout(() => this.animateLast = false, 500);

            let alredInIndex = this.scanSessions.findIndex(x => x.id == scanSession.id);
            if (alredInIndex != -1) {
                this.scanSessions[alredInIndex].scannings.unshift(scanSession.scannings[0]);
                this.selectedScanSession = this.scanSessions[alredInIndex];
            } else {
                this.scanSessions.unshift(scanSession);
                this.selectedScanSession = this.scanSessions[0];
            }
            this.save();
        });
    }

    save() {
        console.log("SAVED")
        this.scanSessionStorage.setScanSessions(this.scanSessions);
    }
}
