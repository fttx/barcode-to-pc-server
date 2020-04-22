import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import ElectronStore from 'electron-store';
import { AlertController, App, Events, Platform } from 'ionic-angular';
import { MarkdownService } from 'ngx-markdown';
import { gt, SemVer } from 'semver';
import { Config } from '../../../electron/src/config';
import { SettingsModel } from '../models/settings.model';
import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
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
    public http: Http,
    public alertCtrl: AlertController,
    public markdownService: MarkdownService,
    public events: Events,
    public utils: UtilsProvider,
    public app: App,
  ) {
    this.store = new this.electronProvider.ElectronStore();

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      electronProvider.sendReadyToMainProcess();

      // The publishing can happen by a drag-n-drop or a double click of a .btpt file
      this.events.subscribe('import_btpt', (filePath) => {
        // Prevent importing files when the SettingsPage is active
        let activeNav = this.app.getActiveNav();
        if (activeNav && activeNav.getActive() && activeNav.getActive().component == SettingsPage) {
          this.alertCtrl.create({
            title: 'Error',
            message: "You must close the Settings page before opening a .btpt file.",
            buttons: [{ text: 'Ok', role: 'cancel', }]
          }).present();
          return;
        }

        // Read the file content
        const fs = this.electronProvider.remote.require('fs');
        const path = this.electronProvider.remote.require('path');
        let outputTemplate;
        try {
          outputTemplate = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch {
          this.alertCtrl.create({
            title: 'Cannot open the file',
            message: "The <b>" + path.basename(filePath) + "</b> file is corrupted or the server doesn't have the read permissions.",
            buttons: [{ text: 'Ok', role: 'cancel', }]
          }).present();
          return;
        }

        this.alertCtrl.create({
          title: 'Import Output template',
          message: 'Do you want to import ' + outputTemplate.name + ' profile?',
          buttons: [{
            text: 'Yes',
            handler: () => {
              let settings: SettingsModel = this.store.get(Config.STORAGE_SETTINGS, new SettingsModel());
              // push isn't working, so we're using the spread operator (duplicated issue on the settings.ts file)
              settings.enableAdvancedSettings = true;
              settings.outputProfiles = [...settings.outputProfiles, outputTemplate];
              this.store.set(Config.STORAGE_SETTINGS, settings);
              if (this.electronProvider.isElectron()) {
                this.electronProvider.ipcRenderer.send('settings');
              }
            }
          }, {
            text: 'Cancel',
            role: 'cancel',
            handler: () => { }
          }]
        }).present();
      })

      window.ondragover = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        return false;
      };

      window.ondrop = (e) => {
        e.preventDefault();
        for (var i = 0; i < e.dataTransfer.files.length; ++i) {
          let path = e.dataTransfer.files[i].path;
          this.events.publish('import_btpt', path)
        }
        return false;
      };

      window.ondragleave = () => { return false; };

      // Used to open files (double click)
      // On Windows when double-clicking, the system passes the file path
      // of the clicked file to the main exectutable.
      let process = this.electronProvider.remote.process;
      let checkArgv = (argv) => {
        if (argv.length >= 2) { // process.platform == 'win32' &&
          this.events.publish('import_btpt', argv[1])
        }
      }
      checkArgv(process.argv);
      this.electronProvider.ipcRenderer.on('second-instance-open', (event, argv) => {
        checkArgv(argv)
      })
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
    return new Promise(async (resolve, reject) => {
      let lastVersion = new SemVer(this.store.get(Config.STORAGE_LAST_VERSION, '0.0.0'));
      let currentVersion = new SemVer(this.electronProvider.app.getVersion());
      // Given a version number MAJOR.MINOR.PATCH, increment the:
      // MAJOR version when you make incompatible API changes,
      // MINOR version when you add functionality in a backwards-compatible manner, and
      // PATCH version when you make backwards-compatible bug fixes.
      // see: https://semver.org/
      if (gt(currentVersion, lastVersion) && lastVersion.compare('0.0.0') != 0) { // update detected (the second proposition is to exclude the first start)
        let settings: SettingsModel = this.store.get(Config.STORAGE_SETTINGS, new SettingsModel());

        // Changelog alert
        // remove urls
        let render = this.markdownService.renderer;
        render.link = function (href, title, text) { return '<b>' + text + '</b>' };
        let httpRes = await this.http.get(Config.URL_GITHUB_CHANGELOG).toPromise();
        let changelog = 'Please make you sure to update also the app on your smatphone.<div style="font-size: .1em">' + this.markdownService.compile(httpRes.text(), { renderer: render }) + '</div>';
        this.alertCtrl.create({
          title: 'The server has been updated',
          message: changelog,
          buttons: ['Ok'],
          cssClass: 'changelog'
        }).present();

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

        // v3.7.0 upgrade
        if (typeof settings.openAutomatically == 'undefined') {
          let openAtLogin = this.electronProvider.app.getLoginItemSettings().openAtLogin;
          let openAsHidden = this.electronProvider.app.getLoginItemSettings().openAsHidden;
          if (openAtLogin) {
            if (openAsHidden) {
              settings.openAutomatically = 'minimized';
            } else {
              settings.openAutomatically = 'yes';
            }
          } else {
            settings.openAutomatically = 'no';
          }
        }

        // v3.8.0 upgrade
        settings.outputProfiles.forEach(outputProfile => {
          outputProfile.outputBlocks.forEach(outputBlock => {
            if (outputBlock.type == 'barcode' && typeof outputBlock.enabledFormats == 'undefined') {
              outputBlock.enabledFormats = [];
            }
          })
        })


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
                outputBlocks.push({ editable: false, name: 'NUMBER', value: scan.quantity, type: 'variable', modifiers: [] });
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
          // then
          await this.utils.upgradeDisplayValue();
        } // Upgrade displayName end

        this.store.set(Config.STORAGE_SETTINGS, JSON.parse(JSON.stringify(settings)));
      } // on update detected end
      this.store.set(Config.STORAGE_LAST_VERSION, currentVersion.version)
      resolve();
    })
  }
}
