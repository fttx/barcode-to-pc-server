import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScanSessionModel } from '../../models/scan-session.model'
import { ScanSessionsService } from '../../services/scan-sessions.service'

@Component({
    selector: 'app-scan-session',
    templateUrl: './scan-session.component.html',
    styleUrls: ['./scan-session.component.scss']
})
export class ScanSessionComponent implements OnInit {

    public scanSession: ScanSessionModel;

    constructor(
        private route: ActivatedRoute,
        private scanSessionService: ScanSessionsService,
    ) { }

    ngOnInit() {
        this.route.params
            .map(params => params['index'])
            .subscribe((index) => {
                if (index != -1) {
                    this.scanSession = this.scanSessionService.getScanSession(index);
                }
            });
    }

}
