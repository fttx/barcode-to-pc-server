import { Component, ViewContainerRef } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {

    constructor(
        public viewContainerRef: ViewContainerRef, // required from ng2-bootstrap Modals
    ) { }

    ngOnInit() { }
}
