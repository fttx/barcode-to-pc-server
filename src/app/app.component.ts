import { Component, ViewContainerRef, OnInit } from '@angular/core';
import { Electron } from './services/electron.service'
import { HttpApi } from './services/http-api.service'
import { RemoteSettingsModel } from './models/http-api.model'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

    constructor(
        public viewContainerRef: ViewContainerRef, // required from ng2-bootstrap Modals
        private electron: Electron,
        private httpApi: HttpApi,
    ) { }

    ngOnInit() {
        this.httpApi.getRemoteSettings().subscribe((data: RemoteSettingsModel) => {
            const version = this.electron.getVersion();
            // console.log('local: ' , version, ' remote:', data.serverVersion);
            if (version != data.serverVersion) {
                this.electron.showMessageBox({
                    type: 'warning',
                    buttons: ['Cancel', 'Download'],
                    defaultId: 1, title: 'Update',
                    message: 'A new version of Barcode to PC is available', cancelId: 0
                }, buttonIndex => {
                    if (buttonIndex === 1) {
                        this.electron.openExternal('https://barcodetopc.com/#download');
                    }
                });
            }
        });
    }
}
