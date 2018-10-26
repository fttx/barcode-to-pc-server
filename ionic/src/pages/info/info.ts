import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { ElectronProvider } from '../../providers/electron/electron';
import { Config } from '../../../../electron/src/config';

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
    return Config.URL_WEBSITE;
  }

  getWebSiteName() {
    return Config.WEB_SITE_NAME;
  }

  getGitHubServer() {
    return Config.URL_GITHUB_SERVER;
  }

  getGitHubApp() {
    return Config.URL_GITHUB_APP;
  }

  getMail() {
    return Config.URL_MAIL;
  }

}
