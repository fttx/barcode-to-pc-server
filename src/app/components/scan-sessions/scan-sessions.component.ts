import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';

import { ScanSessionModel } from '../../models/scan-session.model';
import { SettingsModel } from '../../models/settings.model';
import { Storage } from '../../services/storage.service';

@Component({
    selector: 'app-scan-sessions',
    templateUrl: './scan-sessions.component.html',
    styleUrls: ['./scan-sessions.component.scss']
})

export class ScanSessionsComponent implements OnInit {
    @Input() scanSessions: ScanSessionModel[] = []
    @Output() selectedScanSessionChange: EventEmitter<ScanSessionModel> = new EventEmitter<ScanSessionModel>();
    @Input() selectedScanSession: ScanSessionModel = null;
    
    private settings: SettingsModel = new SettingsModel();;

    constructor(
        private storage: Storage,
    ) { }

    ngOnInit() {
        this.settings = this.storage.getSettings();
    }

    // ngOnChanges(changes: SimpleChanges) {
    //     if (changes['scanSessions'] == null) {
    //         this.selectedScanSession = null;
    //         this.onSelect.emit(null);
    //     }
    // }

    onScanSessionClick(scanSession) {
        this.selectedScanSession = scanSession;
        this.selectedScanSessionChange.emit(scanSession);
    }

    export(index) {
        let content = [];
        content.push(Papa.unparse(this.scanSessions[index].scannings.map(x => { return { 'text': x.text } }), {
            quotes: this.settings.enableQuotes,
            delimiter: ",",
            newline: this.settings.newLineCharacter.replace('CR', '\r').replace('LF', '\n')
        }));
        let file = new Blob(content, { type: 'text/csv;charset=utf-8' });
        saveAs(file, this.scanSessions[index].name + ".csv");
    }
}
