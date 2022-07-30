import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, App, Events, Platform } from 'ionic-angular';
import { MarkdownService } from 'ngx-markdown';
import { gt, SemVer } from 'semver';
import { Config } from '../config';
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
    private translate: TranslateService,
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      electronProvider.sendReadyToMainProcess();

      // The publishing can happen by a drag-n-drop or a double click of a .btpt file
      this.events.subscribe('import_btpt', async (filePath: string) => {
        // Prevent --parameters to be interpreted as file paths
        if (filePath.startsWith('-') || !filePath.endsWith('.btpt')) {
          return
        }

        // Prevent importing files when the SettingsPage is active
        let activeNav = this.app.getActiveNav();
        if (activeNav && activeNav.getActive() && activeNav.getActive().component == SettingsPage) {
          this.alertCtrl.create({
            title: await this.utils.text('closeSettingsDialogTitle'),
            message: await this.utils.text('closeSettingsDialogMessage'),
            buttons: [{ text: await this.utils.text('closeSettingsDialogOkButton'), role: 'cancel', }]
          }).present();
          return;
        }

        // Read the file content
        const path = this.electronProvider.path;
        let outputTemplate;
        try {
          outputTemplate = JSON.parse(this.electronProvider.fsReadFileSync(filePath, { encoding: 'utf-8' }));
        } catch {
          this.alertCtrl.create({
            title: await this.utils.text('openFileErrorDialogTitle'),
            message: await this.utils.text('openFileErrorDialogMessage', {
              "path": path.basename(filePath),
            }),
            buttons: [{ text: await this.utils.text('openFileErrorDialogOkButton'), role: 'cancel', }]
          }).present();
          return;
        }

        this.alertCtrl.create({
          title: await this.utils.text('importOutputTemplateDialogTitle'),
          message: await this.utils.text('importOutputTemplateDialogMessage', {
            "templateName": outputTemplate.name,
          }),
          buttons: [{
            text: await this.utils.text('importOutputTemplateDialogYesButton'),
            handler: () => {
              let settings: SettingsModel = this.electronProvider.store.get(Config.STORAGE_SETTINGS, new SettingsModel(UtilsProvider.GetOS()));
              // push isn't working, so we're using the spread operator (duplicated issue on the settings.ts file)
              settings.enableAdvancedSettings = true;
              settings.outputProfiles = [...settings.outputProfiles, outputTemplate];
              this.electronProvider.store.set(Config.STORAGE_SETTINGS, settings);
              if (ElectronProvider.isElectron()) {
                this.electronProvider.ipcRenderer.send('settings');
              }
            }
          }, {
            text: await this.utils.text('importOutputTemplateDialogCancelButton'),
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

      window.ondrop = (e: any) => {
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
      let checkArgv = (argv: any[]) => {
        if (argv.length >= 2) { // process.platform == 'win32' &&
          const btptPath = argv.find(x => x.endsWith('.btpt'));
          if (btptPath) {
            this.events.publish('import_btpt', btptPath);
          }
        }
      }
      checkArgv(this.electronProvider.processArgv);
      this.electronProvider.ipcRenderer.on('second-instance-open', (event, argv) => {
        checkArgv(argv);
      })
    });

    this.upgrade().then(() => {
      if (this.electronProvider.store.get(Config.STORAGE_FIRST_CONNECTION_DATE, 0) == 0) {
        this.rootPage = WelcomePage;
      } else {
        this.rootPage = HomePage;
      }
    })

    this.devicesProvider.onConnectedDevicesListChange().subscribe(devicesList => {
      if (devicesList.length != 0) {
        this.electronProvider.store.set(Config.STORAGE_FIRST_CONNECTION_DATE, new Date().getTime())
      }
    });

    this.translate.setDefaultLang('en');
    this.translate.use(this.translate.getBrowserLang());

    utils.upgradeIonicStoreToElectronStore();
  }

  upgrade() {
    return new Promise<void>(async (resolve, reject) => {
      let lastVersion = new SemVer(this.electronProvider.store.get(Config.STORAGE_LAST_VERSION, '0.0.0'));
      let currentVersion = new SemVer(this.electronProvider.appGetVersion());
      // Given a version number MAJOR.MINOR.PATCH, increment the:
      // MAJOR version when you make incompatible API changes,
      // MINOR version when you add functionality in a backwards-compatible manner, and
      // PATCH version when you make backwards-compatible bug fixes.
      // see: https://semver.org/
      if (gt(currentVersion, lastVersion) && lastVersion.compare('0.0.0') != 0) { // update detected (the second proposition is to exclude the first start)
        let settings: SettingsModel = this.electronProvider.store.get(Config.STORAGE_SETTINGS, new SettingsModel(UtilsProvider.GetOS()));

        // Changelog alert
        // remove urls
        let render = this.markdownService.renderer;
        render.link = function (href, title, text) { return '<b>' + text + '</b>' };
        let httpRes = await this.http.get(Config.URL_GITHUB_CHANGELOG).toPromise();
        let changelog = await this.utils.text('changelogDialogMessage') + '<div style="font-size: .1em">' + this.markdownService.compile(httpRes.text(), { renderer: render }) + '</div>';
        this.alertCtrl.create({
          title: await this.utils.text('changelogDialogTitle'),
          message: changelog,
          buttons: [await this.utils.text('changelogDialogOkButton')],
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
          let openAtLogin = this.electronProvider.appGetLoginItemSettings().openAtLogin;
          let openAsHidden = this.electronProvider.appGetLoginItemSettings().openAsHidden;
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
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if (outputBlock.type == 'barcode') {
                if (typeof outputBlock.enabledFormats == 'undefined') {
                  outputBlock.enabledFormats = [];
                }
                if (typeof outputBlock.label == 'undefined') {
                  outputBlock.label = null;
                }
              }
            })
          })
        }

        // v3.9.0 upgrade
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if (outputBlock.type == 'select_option') {
                outputBlock.name = 'SELECT_OPTION';
              }
            });
            if (typeof settings.onSmartphoneChargeCommand == 'undefined') {
              settings.onSmartphoneChargeCommand = '';
            }
          })
        }

        // v3.10.0 upgrade
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              // skip output
              if (outputBlock.type == 'select_option' && typeof outputBlock.skipOutput == 'undefined') {
                outputBlock.skipOutput = false;
              } else if (outputBlock.type == 'http' && typeof outputBlock.skipOutput == 'undefined') {
                outputBlock.skipOutput = true;
              } else if (outputBlock.type == 'run' && typeof outputBlock.skipOutput == 'undefined') {
                outputBlock.skipOutput = true;
              } else if (outputBlock.type == 'function' && typeof outputBlock.skipOutput == 'undefined') {
                outputBlock.skipOutput = false;
              }

              // filter
              if ((outputBlock.type == 'barcode' || outputBlock.value == 'number' || outputBlock.value == 'text') && typeof outputBlock.filter == 'undefined') {
                outputBlock.filter = null;
                outputBlock.errorMessage = null;
              }

              // default value
              if (typeof outputBlock.defaultValue == 'undefined') {
                if (outputBlock.value == 'number') {
                  outputBlock.defaultValue = '1';
                } else if (outputBlock.value == 'text') {
                  outputBlock.defaultValue = null;
                }
              }
            });
          })
        }

        // v3.11.1
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              // skip output
              if (outputBlock.type == 'csv_lookup' && typeof outputBlock.skipOutput == 'undefined') {
                outputBlock.skipOutput = false;
              }
            });
          })
        }

        // v3.13.0
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if (outputBlock.type == 'http' && typeof outputBlock.httpMethod == 'undefined') {
                outputBlock.httpMethod = outputBlock.method;
              }
            });
          })
        }

        // v3.14.0
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if (outputBlock.type == 'http' || outputBlock.type == 'run') {
                outputBlock.timeout = null;
              }
            });
          })
        }

        // v3.16.0
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if (outputBlock.type == 'select_option') {
                if (outputBlock.title == null && typeof outputBlock.title == 'undefined') {
                  outputBlock.title = '';
                  outputBlock.message = '';
                }
              }
            });
          })
        }

        // v3.17.0
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if (outputBlock.type == 'function') {
                outputBlock.name = 'JAVASCRIPT_FUNCTION';
              }
              if (outputBlock.type == 'csv_update' && typeof outputBlock.rowToUpdate == 'undefined') {
                outputBlock.rowToUpdate = 'all';
              }
            });
          })
        }
        if (typeof settings.maxScanSessionsNumber == 'undefined') {
          settings.maxScanSessionsNumber = SettingsPage.MAX_SCAN_SESSION_NUMBER_UNLIMITED;
        }

        // v3.19.0
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if (outputBlock.type == 'http' && typeof outputBlock.httpOAuthMethod == 'undefined') {
                outputBlock.httpOAuthMethod = 'disabled';
                outputBlock.httpOAuthConsumerKey = null;
                outputBlock.httpOAuthConsumerKey = null;
              }
            });
          })
        }

        // v4.0.0
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if (outputBlock.type == 'date_time' && typeof outputBlock.matchBarcodeDate == 'undefined') {
                outputBlock.matchBarcodeDate = true;
              }
            });
          })
        }

        // v4.1.0
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if (outputBlock.type == 'key' && typeof outputBlock.modifierKeys == 'undefined') {
                outputBlock.modifierKeys = [];
                outputBlock.modifiers.forEach(modifier => {
                  switch (modifier) {
                    case 'alt': outputBlock.modifierKeys.push(SettingsModel.KEYS_MODIFERS.find(x => x.name.includes('LeftAlt')).id); break;
                    case 'command': outputBlock.modifierKeys.push(SettingsModel.KEYS_MODIFERS.find(x => x.name.includes('LeftSuper')).id); break;
                    case 'control': outputBlock.modifierKeys.push(SettingsModel.KEYS_MODIFERS.find(x => x.name.includes('LeftControl')).id); break;
                    case 'shift': outputBlock.modifierKeys.push(SettingsModel.KEYS_MODIFERS.find(x => x.name.includes('LeftShift')).id); break;
                  }
                });
              }
            });
          })
        }

        if (typeof settings.maxScanSessionsNumber == 'undefined') {
          settings.maxScanSessionsNumber = SettingsPage.MAX_SCAN_SESSION_NUMBER_UNLIMITED;
        }

        // Upgrade output profiles
        if (typeof settings.outputProfiles == 'undefined') {
          settings.outputProfiles = new SettingsModel(UtilsProvider.GetOS()).outputProfiles;
          settings.outputProfiles[0].outputBlocks = settings.typedString;

          let scanSessions = this.electronProvider.store.get(Config.STORAGE_SCAN_SESSIONS, []);
          for (let scanSession of scanSessions) {
            for (let scan of scanSession.scannings) {
              let outputBlocks = [];
              outputBlocks.push({ name: 'BARCODE', value: 'BARCODE', type: 'barcode', editable: true, skipOutput: false });
              if (scan.quantity) {
                outputBlocks.push({ editable: false, name: 'NUMBER', value: scan.quantity, type: 'variable', modifiers: [] });
              }
              outputBlocks.push({ name: 'ENTER', value: SettingsModel.KEY_ID_ENTER, type: 'key', modifiers: [] });
              scan.outputBlocks = outputBlocks;
            }
          }
          this.electronProvider.store.set(Config.STORAGE_SCAN_SESSIONS, JSON.parse(JSON.stringify(scanSessions)));
        } // Upgrade output profiles end


        // Upgrade displayValue
        if (
          // if it's upgrading from an older version, and the upgrade was never started (null)
          (lastVersion.compare('3.1.5') == -1 && this.electronProvider.store.get('upgraded_displayValue', null) == null)
          || // or
          // if the update has been started, but not completed (null)
          this.electronProvider.store.get('upgraded_displayValue', null) === false) {
          // then
          await this.utils.upgradeDisplayValue();
        } // Upgrade displayName end

        this.electronProvider.store.set(Config.STORAGE_SETTINGS, JSON.parse(JSON.stringify(settings)));
      } // on update detected end
      this.electronProvider.store.set(Config.STORAGE_LAST_VERSION, currentVersion.version)
      resolve();

    })
  }
}
