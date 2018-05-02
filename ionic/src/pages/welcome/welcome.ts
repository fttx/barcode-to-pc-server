import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { requestModel, requestModelHelo } from '../../models/request.model';
import { ConfigProvider } from '../../providers/config/config';
import { ElectronProvider } from '../../providers/electron/electron';
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
    private toastCtrl: ToastController,
    private utilsService: UtilsProvider,
  ) {
    if (this.electronProvider.isElectron()) {
      this.electronProvider.ipcRenderer.on(requestModel.ACTION_HELO, (e, request: requestModelHelo) => {
        this.navCtrl.setRoot(HomePage);

        this.toastCtrl.create({
          message: 'A connection was successfully established with ' + request.deviceName,
          duration: 6000
        }).present();
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
    this.electronProvider.shell.openExternal(ConfigProvider.URL_FAQ_APP_DOESNT_FIND_COMPUTER);
  }
}
