import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { ScanSessionModel } from '../../models/scan-session.model'
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-scan-sessions',
    templateUrl: './scan-sessions.component.html',
    styleUrls: ['./scan-sessions.component.scss']
})

export class ScanSessionsComponent implements OnInit {
    @Input() scanSessions: ScanSessionModel[] = []
    @Input() selectedScanSession: ScanSessionModel;
    @Output() onSelect = new EventEmitter();

    constructor() { }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['selectedScanSession']) {
            // TODO scrollTop
        }
    }

    onItemSelected(index) {
        this.onSelect.emit(this.scanSessions[index]);
    }

    export(index) {
        let content = this.scanSessions[index].scannings.map(x => x.text + "\n")
        let file = new Blob(content, { type: 'text/csv;charset=utf-8' });
        saveAs(file, this.scanSessions[index].name + ' - ' + this.scanSessions[index].date + ".csv");
    }
}
