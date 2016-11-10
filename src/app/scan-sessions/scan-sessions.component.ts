import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScanSessionModel } from '../../models/scan-session.model'
import { ScanSessionsService } from '../../services/scan-sessions.service'

@Component({
    selector: 'app-scan-sessions',
    templateUrl: './scan-sessions.component.html',
    styleUrls: ['./scan-sessions.component.scss']
})

export class ScanSessionsComponent implements OnInit {

    public scanSessions: ScanSessionModel[] = [];

    constructor(
        private router: Router,
        private scanSessionService: ScanSessionsService,

    ) { }

    ngOnInit() {
        this.scanSessionService.getScanSessions().subscribe(
            message => {
                this.scanSessions = message;
            },
            err => {

            });
    }


    onItemSelected(index) {
        this.router.navigate(['', index]);
    }
}
