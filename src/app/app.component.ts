import { Component, ViewContainerRef, OnInit } from '@angular/core';
import { HttpApi } from './services/http-api.service'
import { RemoteSettingsModel } from './models/http-api.model'
import { ElectronService } from './services/electron.service';
import { ConfigService } from './services/config.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

    constructor(
        public viewContainerRef: ViewContainerRef, // required from ng2-bootstrap Modals
        private httpApi: HttpApi,
        public electronService: ElectronService,
    ) { }

    ngOnInit() {
        this.httpApi.getRemoteSettings().subscribe((data: RemoteSettingsModel) => {

            if (this.electronService.isElectron()) {

                const version = this.electronService.app.getVersion();
                // console.log('local: ' , version, ' remote:', data.serverVersion);
                if (version != data.serverVersion) {

                    this.electronService.dialog.showMessageBox({
                        type: 'warning',
                        buttons: ['Cancel', 'Download'],
                        defaultId: 1, title: 'Update',
                        message: 'A new version of Barcode to PC is available', cancelId: 0
                    }, buttonIndex => {
                        if (buttonIndex === 1) {
                            this.electronService.shell.openExternal(ConfigService.URL_DOWNLOAD);
                        }
                    });
                }
            }
        });
    }
}
