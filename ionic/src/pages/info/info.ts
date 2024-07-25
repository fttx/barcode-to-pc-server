import { Component, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, NavController, NavParams, ViewController } from 'ionic-angular';
import { Config } from '../../config';
import { SettingsModel } from '../../models/settings.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { UtilsProvider } from '../../providers/utils/utils';
import { HttpClient } from '@angular/common/http';

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
  // the same variable can be found in the update.handler.ts of the main process
  public updateStatus: ('checkingForUpdate' | 'updateAvailable' | 'updateNotAvailable' |
    'updateError') = 'updateNotAvailable';
  public settings: SettingsModel; // required for the toggle ngModel to work
  public newVersion: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
    public ngZone: NgZone,
    public utils: UtilsProvider,
    private translateService: TranslateService,
    private http: HttpClient,
    private alertController: AlertController
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoPage');
    this.settings = this.electronProvider.store.get(Config.STORAGE_SETTINGS, new SettingsModel(UtilsProvider.GetOS()));

    // the main process communicates the status of the update to the renderer process
    this.electronProvider.ipcRenderer.on('onUpdateStatusChange', (e, updateStatus) => {
      this.ngZone.run(() => {
        this.updateStatus = updateStatus;
      })
    });

    // autoUpdater.checkUpdates() is always called on app start by the main
    // process in UpdateHandler/constructor/onSettingsChanged
    // Now i tell the main process to call it once again to check
    // to perform an update check when the Info page is opened.
    this.electronProvider.ipcRenderer.send('checkForUpdates');
  }

  // ion-toggle event
  onAutoUpdateChange(event) {
    this.electronProvider.store.set(Config.STORAGE_SETTINGS, this.settings);
    // notify the main process that the settings changed
    if (ElectronProvider.isElectron()) {
      this.electronProvider.ipcRenderer.send('settings');
    }
  }

  close() {
    this.viewCtrl.dismiss();
  }

  getVersion() {
    if (this.electronProvider.isDev()) {
      return '(DEV MODE)'
    } else if (ElectronProvider.isElectron()) {
      return this.electronProvider.appGetVersion();
    } else {
      return '(BROWSER MODE)'
    }
  }

  getWebSiteUrl() {
    return Config.URL_WEBSITE;
  }

  getWebSiteName() {
    return Config.WEBSITE_NAME;
  }

  getGitHubServer() {
    return Config.URL_GITHUB_SERVER;
  }

  getGitHubApp() {
    return Config.URL_GITHUB_APP;
  }

  getMailUrl() {
    return 'mailto:' + Config.EMAIL_SUPPORT;
  }

  getMail() {
    return Config.EMAIL_SUPPORT;
  }

  getAppName() {
    return Config.APP_NAME;
  }

  // Methods to "translate" the status received from the MAIN process to the user interface
  getUpdateStatus() {
    if (this.updateStatus == 'checkingForUpdate') return this.translateService.instant('checkingForUpdates');
    if (this.updateStatus == 'updateAvailable') return this.translateService.instant('outOfDate', {
      "appName": Config.APP_NAME,
    })
    if (this.updateStatus == 'updateNotAvailable') return this.translateService.instant('upToDate', {
      "appName": Config.APP_NAME,
    })
    if (this.updateStatus == 'updateError') return this.translateService.instant('updateError');
    if (this.updateStatus == 'updateDownloaded') return this.translateService.instant('readyForUpdate', {
      "appName": Config.APP_NAME,
    });
  }

  getUpdateIcon() {
    // if (this.updateStatus == 'checkingForUpdate') return ''; // updating => spinner
    if (this.updateStatus == 'updateAvailable') return 'refresh-circle';
    if (this.updateStatus == 'updateNotAvailable') return 'checkmark-circle';
    if (this.updateStatus == 'updateError') return 'close-circle';
  }

  getLastUpdateCheck() {
    return localStorage.getItem('lastUpdateCheck') || 'Never';
  }

  checkForUpdates() {
    const repoOwner = 'fttx';
    const repoName = 'barcode-to-pc-server';
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

    localStorage.setItem('lastUpdateCheck', new Date().toLocaleString());
    this.updateStatus = 'checkingForUpdate';
    this.http.get(url).subscribe(
      async (data: any) => {
        this.newVersion = data.tag_name;
        if (this.newVersion !== this.getVersion()) {
          this.updateStatus = 'updateAvailable';
          this.electronProvider.ipcRenderer.send('downloadUpdate');
          // Dialog will be shown by the native elctron-update-app package.
        } else {
          this.updateStatus = 'updateNotAvailable';
          this.alertController.create({ title: 'No Updates', message: this.translateService.instant('youAreUsingLatestVersion'), buttons: [await this.utils.text('ok')] }).present();
        }
      },
      async (error) => {
        this.updateStatus = 'updateError';
        this.alertController.create({ title: 'Error', message: this.translateService.instant('couldNotCheckForUpdates'), buttons: [await this.utils.text('ok')] }).present();
      }
    );
  }

  getUpdateButtonText() {
    if (this.updateStatus == 'checkingForUpdate') return this.translateService.instant('update'); // disabled
    if (this.updateStatus == 'updateAvailable') return this.translateService.instant('update');
    if (this.updateStatus == 'updateNotAvailable') return this.translateService.instant('update');
    if (this.updateStatus == 'updateError') return this.translateService.instant('update');
  }

}
