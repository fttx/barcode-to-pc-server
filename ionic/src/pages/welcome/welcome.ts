import { Component, NgZone } from '@angular/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';
import { Config } from '../../config';

import { requestModel, requestModelHelo } from '../../models/request.model';
import { SettingsModel } from '../../models/settings.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { LastToastProvider } from '../../providers/last-toast/last-toast';
import { UtilsProvider } from '../../providers/utils/utils';
import { HomePage } from '../home/home';
import { WelcomeHelpPage } from '../welcome-help/welcome-help';
import { TelemetryService } from '../../providers/telemetry/telemetry';

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
    public modalCtrl: ModalController,
    private telemetryProvider: TelemetryService
  ) {
    if (ElectronProvider.isElectron()) {
      this.electronProvider.ipcRenderer.on(requestModel.ACTION_HELO, (e, request: requestModelHelo) => {
        ngZone.run(() => {
          const settings: SettingsModel = this.electronProvider.store.get(Config.STORAGE_SETTINGS, new SettingsModel(UtilsProvider.GetOS()));
          settings.openAutomatically = 'minimized';
          this.electronProvider.store.set(Config.STORAGE_SETTINGS, settings);
          this.navCtrl.setRoot(HomePage);
        })
      });
    }
    this.utilsService.getQrCodeUrl().then((url: string) => this.qrCodeUrl = url);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WelcomePage');
    this.telemetryProvider.sendEvent('page_welcome', null, null);
  }

  onSkipClick() {
    this.navCtrl.setRoot(HomePage);
    this.telemetryProvider.sendEvent('page_welcome_skip', null, null);
  }

  onHelpClick() {
    this.modalCtrl.create(WelcomeHelpPage).present();
    this.telemetryProvider.sendEvent('page_welcome_help', null, null);
  }

  onPlayStoreClick() {
    this.electronProvider.shell.openExternal(Config.URL_PLAYSTORE);
    this.telemetryProvider.sendEvent('page_welcome_playstore', null, null);
  }

  onAppStoreClick() {
    this.electronProvider.shell.openExternal(Config.URL_APPSTORE);
    this.telemetryProvider.sendEvent('page_welcome_appstore', null, null);
  }
}
