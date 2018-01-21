import { Component, ViewContainerRef, OnInit } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { ConfigService } from './services/config.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

    constructor(
        public viewContainerRef: ViewContainerRef, // required from ngx-bootstrap Modals
        public electronService: ElectronService,
    ) { }

    ngOnInit() {
       
    }
}
