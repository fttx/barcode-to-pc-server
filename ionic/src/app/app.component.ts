import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import ElectronStore from 'electron-store';
import { AlertController, Platform } from 'ionic-angular';
import { gt, SemVer } from 'semver';
import { Config } from '../../../electron/src/config';
import { ScanModel } from '../models/scan.model';
import { SettingsModel } from '../models/settings.model';
import { HomePage } from '../pages/home/home';
import { WelcomePage } from '../pages/welcome/welcome';
import { DevicesProvider } from '../providers/devices/devices';
import { ElectronProvider } from '../providers/electron/electron';
import { UtilsProvider } from '../providers/utils/utils';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  private store: ElectronStore;

  // rootPage: any = SettingsPage;
  rootPage: any = null;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public electronProvider: ElectronProvider,
    public devicesProvider: DevicesProvider,
    private alertCtrl: AlertController,
    utils: UtilsProvider
  ) {
    this.store = new this.electronProvider.ElectronStore();

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      electronProvider.sendReadyToMainProcess();
    });

    this.upgrade().then(() => {
      if (this.store.get(Config.STORAGE_FIRST_CONNECTION_DATE, 0) == 0) {
        this.rootPage = WelcomePage;
      } else {
        this.rootPage = HomePage;
      }
    })

    this.devicesProvider.onConnectedDevicesListChange().subscribe(devicesList => {
      if (devicesList.length != 0) {
        this.store.set(Config.STORAGE_FIRST_CONNECTION_DATE, new Date().getTime())
      }
    });

    utils.upgradeIonicStoreToElectronStore();
  }

  upgrade() {
    return new Promise((resolve, reject) => {
      let lastVersion = new SemVer(this.store.get(Config.STORAGE_LAST_VERSION, '0.0.0'));
      let currentVersion = new SemVer(this.electronProvider.app.getVersion());
      // Given a version number MAJOR.MINOR.PATCH, increment the:
      // MAJOR version when you make incompatible API changes,
      // MINOR version when you add functionality in a backwards-compatible manner, and
      // PATCH version when you make backwards-compatible bug fixes.
      // see: https://semver.org/
      if (gt(currentVersion, lastVersion) && lastVersion.compare('0.0.0') != 0) { // update detected (the second proposition is to exclude the first start)
        let settings: SettingsModel = this.store.get(Config.STORAGE_SETTINGS, new SettingsModel());

        // v3 upgrade
        if (typeof settings.autoUpdate == 'undefined') {
          settings.autoUpdate = true;
        }
        if (typeof settings.csvPath == 'undefined') {
          settings.csvPath = null;
        }
        if (typeof settings.csvDelimiter == 'undefined') {
          settings.csvDelimiter = ',';
        }
        if (typeof settings.exportOnlyText == 'undefined') {
          settings.exportOnlyText = true;
        }

        // Upgrade output profiles
        if (typeof settings.outputProfiles == 'undefined') {
          settings.outputProfiles = new SettingsModel().outputProfiles;
          settings.outputProfiles[0].outputBlocks = settings.typedString;

          let scanSessions = this.store.get(Config.STORAGE_SCAN_SESSIONS, []);
          for (let scanSession of scanSessions) {
            for (let scan of scanSession.scannings) {
              let outputBlocks = [];
              outputBlocks.push({ name: 'BARCODE', value: 'BARCODE', type: 'barcode', editable: true, skipOutput: false });
              if (scan.quantity) {
                outputBlocks.push({ editable: false, name: 'QUANTITY', value: scan.quantity, type: 'variable', modifiers: [] });
              }
              outputBlocks.push({ name: 'ENTER', value: 'enter', type: 'key', modifiers: [] });
              scan.outputBlocks = outputBlocks;
            }
          }
          this.store.set(Config.STORAGE_SCAN_SESSIONS, JSON.parse(JSON.stringify(scanSessions)));
        } // Upgrade output profiles end


        // Upgrade displayValue
        if (
          // if it's upgrading from an older version, and the upgrade was never started (null)
          (lastVersion.compare('3.1.5') == -1 && this.store.get('upgraded_displayValue', null) == null)
          || // or
          // if the update has been started, but not completed (null)
          this.store.get('upgraded_displayValue', null) === false) {

          // mark the update as "started"
          this.store.set('upgraded_displayValue', false);

          let alert = this.alertCtrl.create({
            title: 'Updating database',
            message: 'The server database is updating, <b>do not close</b> it.<br><br>It may take few minutes, please wait...',
            enableBackdropDismiss: false,
          });

          // upgrade db
          alert.present();
          let scanSessions = this.store.get(Config.STORAGE_SCAN_SESSIONS, []);
          for (let scanSession of scanSessions) {
            for (let scan of scanSession.scannings) {
              scan.displayValue = ScanModel.ToString(scan);
            }
          }
          this.store.set(Config.STORAGE_SCAN_SESSIONS, JSON.parse(JSON.stringify(scanSessions)));
          alert.dismiss();

          // mark the update as "finished" (true)
          this.store.set('upgraded_displayValue', true);
        } // Upgrade displayName end


        this.store.set(Config.STORAGE_SETTINGS, JSON.parse(JSON.stringify(settings)));
      } // on update detected end
      this.store.set(Config.STORAGE_LAST_VERSION, currentVersion.version)
      resolve();
    })
  }
}
