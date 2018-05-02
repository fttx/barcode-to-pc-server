import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { ElectronProvider } from '../../providers/electron/electron';
import { ConfigProvider } from '../../providers/config/config';

/**
 * Generated class for the InfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-info',
  templateUrl: 'info.html',
})
export class InfoPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoPage');
  }


  close() {
    this.viewCtrl.dismiss();
  }

  getVersion() {
    if (this.electronProvider.isDev()) {
      return '(DEV MODE)'
    } else if (this.electronProvider.isElectron()) {
      return this.electronProvider.app.getVersion();
    } else {
      return '(BROWSER MODE)'
    }
  }

  getWebSiteUrl() {
    return ConfigProvider.URL_WEBSITE;
  }

  getWebSiteName() {
    return ConfigProvider.WEB_SITE_NAME;
  }

  getGitHubServer() {
    return ConfigProvider.URL_GITHUB_SERVER;
  }

  getGitHubApp() {
    return ConfigProvider.URL_GITHUB_APP;
  }

  getMail() {
    return ConfigProvider.URL_MAIL;
  }

}
