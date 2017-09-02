import { Component, ViewChild, OnInit } from '@angular/core';

import { ModalDirective } from 'ng2-bootstrap';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { SettingsModel } from '../../models/settings.model'
import { ScanSessionModel } from '../../models/scan-session.model'
import { IpcProxy } from '../../services/ipc-proxy.service'
import { Electron } from '../../services/electron.service'
import { Storage } from '../../services/storage.service'
import { StringComponentModel } from "app/models/string-component.model";

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
    @ViewChild('settingsModal') public settingsModal: ModalDirective;
    @ViewChild('infoModal') public infoModal: ModalDirective;


    public scanSessions: ScanSessionModel[] = [];
    public selectedScanSession: ScanSessionModel;
    public animateLast = false;

    public settings: SettingsModel = new SettingsModel();

    public availableComponents: StringComponentModel[] = this.getAvailableComponents();
    private getAvailableComponents(): StringComponentModel[] {
        return [
            { name: 'BACKSPACE', value: 'backspace', type: 'key' },
            { name: 'DELETE', value: 'delete', type: 'key' },
            { name: 'ALT', value: 'ALT', type: 'key' },
            { name: 'ENTER', value: 'enter', type: 'key' },
            { name: 'TAB', value: 'tab', type: 'key' },
            { name: 'ESCAPE', value: 'escape', type: 'key' },
            { name: '&uarr;', value: 'up', type: 'key' },
            { name: '&rarr;', value: 'right', type: 'key' },
            { name: '&darr;', value: 'down', type: 'key' },
            { name: '&larr;', value: 'left', type: 'key' },
            { name: 'HOME', value: 'home', type: 'key' },
            { name: 'END', value: 'end', type: 'key' },
            { name: 'PAGEUP', value: 'pageup', type: 'key' },
            { name: 'PAGEDOWN', value: 'pagedown', type: 'key' },
            { name: 'COMMAND', value: 'command', type: 'key' },
            { name: 'ALT', value: 'alt', type: 'key' },
            { name: 'CONTROL', value: 'control', type: 'key' },
            { name: 'SHIFT', value: 'shift', type: 'key' },
            { name: 'RIGHT_SHIFT', value: 'right_shift', type: 'key' },
            { name: 'SPACE', value: 'space', type: 'key' },

            { name: 'TIMESTAMP', value: 'Date.now()', type: 'variable' },
            { name: 'DATE', value: 'new Date().toLocaleDateString()', type: 'variable' },
            { name: 'TIME', value: 'new Date().toLocaleTimeString()', type: 'variable' },
            { name: 'DATE_TIME', value: 'new Date().toLocaleDateTimeString()', type: 'variable' },
            { name: 'SCAN_INDEX', value: 'scan_index', type: 'variable' },
            { name: 'DEVICE_NAME', value: 'deviceName', type: 'variable' },

            { name: 'Custom text (click to edit)', value: 'Custom text', type: 'text' },

            { name: 'BARCODE', value: 'BARCODE', type: 'barcode' },
        ];
    }

    constructor(
        private ipcProxy: IpcProxy,
        public electron: Electron,
        private storage: Storage,
        private dragulaService: DragulaService,
    ) {
        dragulaService.drop.subscribe(value => {
            if (value[3].className.indexOf('components-available') != -1) {
                this.availableComponents = this.getAvailableComponents();
            }
        });

        dragulaService.out.subscribe(value => {
            if (value[3].className.indexOf('components-typed') != -1) {
                dragulaService.find('components').drake.remove();
            }
        });
    }

    ngOnInit() {
        this.settingsModal.onHide.subscribe(() => {
            this.storage.settings = this.settings;
            this.ipcProxy.sendSettings(this.settings);
        });

        this.settings = this.storage.settings;
        this.scanSessions = this.storage.scanSessions;

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
        this.storage.scanSessions = this.scanSessions;
    }

}
