import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import ElectronStore from 'electron-store';
import { Platform } from 'ionic-angular';
import { gt, SemVer } from 'semver';
import { Config } from '../../../electron/src/config';
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
  rootPage: any = HomePage;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public electronProvider: ElectronProvider,
    public devicesProvider: DevicesProvider,
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

    let lastVersion = new SemVer(this.store.get(Config.STORAGE_LAST_VERSION, '0.0.0'));
    let currentVersion = new SemVer(this.electronProvider.app.getVersion());
    // Given a version number MAJOR.MINOR.PATCH, increment the:
    // MAJOR version when you make incompatible API changes,
    // MINOR version when you add functionality in a backwards-compatible manner, and
    // PATCH version when you make backwards-compatible bug fixes.
    // see: https://semver.org/
    if (gt(currentVersion, lastVersion) && !lastVersion.compare('0.0.0')) { // update detected (the second proposition is to exclude the first start)
      // new v3 variables fix start
      let settings: SettingsModel = this.store.get(Config.STORAGE_SETTINGS, new SettingsModel());
      if (typeof settings.autoUpdate == 'undefined') {
        settings.autoUpdate = true;
      }
      if (typeof settings.csvPath == 'undefined') {
        settings.csvPath = null;
      }
      if (typeof settings.outputProfiles == 'undefined') {
        settings.outputProfiles = new SettingsModel().outputProfiles;
      }
      this.store.set(Config.STORAGE_SETTINGS, JSON.parse(JSON.stringify(settings)));
      // new v3 variables fix end
    }
    this.store.set(Config.STORAGE_LAST_VERSION, currentVersion.version)

    if (this.store.get(Config.STORAGE_FIRST_CONNECTION_DATE, 0) == 0) {
      this.rootPage = WelcomePage;
    }

    this.devicesProvider.onConnectedDevicesListChange().subscribe(devicesList => {
      if (devicesList.length != 0) {
        this.store.set(Config.STORAGE_FIRST_CONNECTION_DATE, new Date().getTime())
      }
    });

    utils.upgradeIonicStoreToElectronStore();
  }
}
