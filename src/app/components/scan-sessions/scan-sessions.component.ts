import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { ScanSessionModel } from '../../models/scan-session.model'
import { SettingsModel } from '../../models/settings.model'
import { Storage } from '../../services/storage.service'
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';

@Component({
    selector: 'app-scan-sessions',
    templateUrl: './scan-sessions.component.html',
    styleUrls: ['./scan-sessions.component.scss']
})

export class ScanSessionsComponent implements OnInit {
    @Input() scanSessions: ScanSessionModel[] = []
    @Input() selectedScanSession: ScanSessionModel;
    @Output() onSelect = new EventEmitter();

    private settings: SettingsModel = new SettingsModel();;

    constructor(
        private storage: Storage,
    ) { }

    ngOnInit() {
        this.storage.getSettings().then(settings => {
            if (settings) {
                this.settings = settings;
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['selectedScanSession']) {
            // TODO scrollTop
        }
    }

    onItemSelected(index) {
        this.onSelect.emit(this.scanSessions[index]);
    }

    export(index) {
        let content = [];
        content.push(Papa.unparse(this.scanSessions[index].scannings.map(x => { return { 'text': x.text } }), {
            quotes: this.settings.enableQuotes,
            delimiter: ",",
            newline: this.settings.newLineCharacter
        }));
        let file = new Blob(content, { type: 'text/csv;charset=utf-8' });
        saveAs(file, this.scanSessions[index].name + ".csv");
    }
}
