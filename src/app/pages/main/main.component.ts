import { Component, ViewChild } from '@angular/core';

import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';

import { SettingsModel } from '../../models/settings.model'
import { ScanSessionModel } from '../../models/scan-session.model'
import { IpcProxy } from '../../services/ipc-proxy.service'
import { Electron } from '../../services/electron.service'
import { Storage } from '../../services/storage.service'

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent {
    @ViewChild('settingsModal') public settingsModal: ModalDirective;
    @ViewChild('infoModal') public infoModal: ModalDirective;


    public scanSessions: ScanSessionModel[] = [];
    public selectedScanSession: ScanSessionModel;
    public animateLast = false;

    public settings: SettingsModel = new SettingsModel();

    constructor(
        private ipcProxy: IpcProxy,
        private electron: Electron,
        private storage: Storage,
    ) { }

    ngOnInit() {
        this.settingsModal.onHide.subscribe(() => {
            this.storage.setSettings(this.settings);
            this.ipcProxy.sendSettings(this.settings);
        });

        this.storage.getSettings().then(settings => {
            if (settings) {
                this.settings = settings;
            }
        });

        this.storage.getScanSessions().then(scanSessions => {
            if (this.scanSessions) {
                this.scanSessions = scanSessions;
            }
        })

        this.ipcProxy.onPutScanSessions().subscribe(scanSessions => {
            this.scanSessions = scanSessions;
            this.save();
        });

        this.ipcProxy.onPutScan().subscribe(scanSession => {
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

        this.ipcProxy.onDeleteScan().subscribe((associatedScanSession: ScanSessionModel) => {
            let scanSessionIndex = this.scanSessions.findIndex(x => x.id == associatedScanSession.id);
            if (scanSessionIndex != -1) {
                let scanIndex = this.scanSessions[scanSessionIndex].scannings.findIndex(x => x.id == associatedScanSession.scannings[0].id);
                this.scanSessions[scanSessionIndex].scannings.splice(scanIndex, 1);
            }
            this.save();
        });

        this.ipcProxy.onDeleteScanSessions().subscribe((scanSession: ScanSessionModel) => {
            let scanSessionIndex = this.scanSessions.findIndex(x => x.id == scanSession.id);
            if (scanSessionIndex != -1) {
                this.scanSessions.splice(scanSessionIndex, 1);
                this.save();
            }
        });
    }

    save() {
        console.log("SAVED")
        this.storage.setScanSessions(this.scanSessions);
    }

}
