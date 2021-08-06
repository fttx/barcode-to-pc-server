import { Component, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { requestModel, requestModelHelo } from '../../models/request.model';
import { Config } from '../../../../electron/src/config';
import { ElectronProvider } from '../../providers/electron/electron';
import { LastToastProvider } from '../../providers/last-toast/last-toast';
import { UtilsProvider } from '../../providers/utils/utils';
import { HomePage } from '../home/home';

/**
 * Generated class for the WelcomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {
  public qrCodeUrl = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public electronProvider: ElectronProvider,
    private lastToast: LastToastProvider,
    private utilsService: UtilsProvider,
    public ngZone: NgZone,
  ) {
    if (this.electronProvider.isElectron()) {
      this.electronProvider.ipcRenderer.once(requestModel.ACTION_HELO, (e, request: requestModelHelo) => {
        ngZone.run(() => {
          this.navCtrl.setRoot(HomePage);
        })
      });
    }
    this.utilsService.getQrCodeUrl().then((url: string) => this.qrCodeUrl = url);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WelcomePage');
  }

  onSkipClick() {
    this.navCtrl.setRoot(HomePage);
  }

  onHelpClick() {
    this.electronProvider.shell.openExternal(Config.URL_FAQ_APP_DOESNT_FIND_COMPUTER);
  }

  onPlayStoreClick() {
    this.electronProvider.shell.openExternal(Config.URL_PLAYSTORE);
  }

  onAppStoreClick() {
    this.electronProvider.shell.openExternal(Config.URL_APPSTORE);
  }
}
