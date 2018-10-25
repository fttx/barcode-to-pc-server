import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { requestModel, requestModelHelo } from '../../models/request.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { LastToastProvider } from '../../providers/last-toast/last-toast';
import { UtilsProvider } from '../../providers/utils/utils';
import { HomePage } from '../home/home';
import { Config } from '../../config';

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
  ) {
    if (this.electronProvider.isElectron()) {
      this.electronProvider.ipcRenderer.on(requestModel.ACTION_HELO, (e, request: requestModelHelo) => {
        this.navCtrl.setRoot(HomePage);

        this.lastToast.present('A connection was successfully established with ' + request.deviceName);
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
}
