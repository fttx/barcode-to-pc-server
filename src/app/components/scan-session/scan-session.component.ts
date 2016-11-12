import { Component, OnInit, Input, trigger, state, style, transition, animate } from '@angular/core';
import { ScanSessionModel } from '../../models/scan-session.model'
import { ScanSessionsService } from '../../services/scan-sessions.service'

@Component({
    selector: 'app-scan-session',
    templateUrl: './scan-session.component.html',
    styleUrls: ['./scan-session.component.scss'],
    animations: [
        trigger('addedJustNowState', [
            state('true', style({
                backgroundColor: 'rgba(183, 28, 28, 0.4)',
            })),
            transition('* => true', animate('500ms ease-in')),
            transition('true => *', animate('500ms ease-out')),
        ])
    ]
})
export class ScanSessionComponent implements OnInit {
    @Input() scanSession: ScanSessionModel;
    @Input() animateLast = false;

    constructor(
        private scanSessionService: ScanSessionsService,
    ) { }

    ngOnInit() { }
}
