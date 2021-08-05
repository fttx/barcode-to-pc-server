import { Component, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import ElectronStore from 'electron-store';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Config } from '../../../../electron/src/config';
import { SettingsModel } from '../../models/settings.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { UtilsProvider } from '../../providers/utils/utils';

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
    'updateError' | 'updateDownloaded') = 'updateNotAvailable';
  public settings: SettingsModel; // required for the toggle ngModel to work
  private store: ElectronStore;
  private _lastUpdateCheck = '';


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
    public ngZone: NgZone,
    public utils: UtilsProvider,
    private translateService: TranslateService,
  ) {
    this.store = new this.electronProvider.ElectronStore();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoPage');
    this.settings = this.store.get(Config.STORAGE_SETTINGS, new SettingsModel());

    // the main process communicates the status of the update to the renderer process
    this.electronProvider.ipcRenderer.on('onUpdateStatusChange', (e, updateStatus) => {
      this.ngZone.run(() => {
        this.updateStatus = updateStatus;
        if (updateStatus != 'checkingForUpdate') {
          this._lastUpdateCheck = new Date().toLocaleString();
        }
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
    this.store.set(Config.STORAGE_SETTINGS, this.settings);
    // notify the main process that the settings changed
    if (this.electronProvider.isElectron()) {
      this.electronProvider.ipcRenderer.send('settings');
    }
  }

  close() {
    this.viewCtrl.dismiss();
  }

  getLastUpdateCheck() {
    return this._lastUpdateCheck;
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
    if (this.updateStatus == 'updateDownloaded') return 'refresh';
  }

  getUpdateButtonText() {
    if (this.updateStatus == 'checkingForUpdate') return this.translateService.instant('update'); // disabled
    if (this.updateStatus == 'updateAvailable') return this.translateService.instant('update');
    if (this.updateStatus == 'updateNotAvailable') return this.translateService.instant('update');
    if (this.updateStatus == 'updateError') return this.translateService.instant('update');
    if (this.updateStatus == 'updateDownloaded') return this.translateService.instant('relaunch');
  }

  onUpdateClick() {
    if (this.updateStatus == 'updateAvailable') {
      this.electronProvider.ipcRenderer.send('downloadUpdate');
      this.updateStatus = 'checkingForUpdate';
    } else if (this.updateStatus == 'updateDownloaded') {
      this.electronProvider.ipcRenderer.send('quitAndInstall');
    } else {
      this.electronProvider.ipcRenderer.send('checkForUpdates');
    }
  }
}
