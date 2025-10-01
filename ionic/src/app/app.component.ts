import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, App, Events, Platform, ModalController } from 'ionic-angular';
import { MarkdownService } from 'ngx-markdown';
import { eq, gt, SemVer } from 'semver';
import { Config } from '../config';
import { NutjsKey, NutjsKeyV482 } from '../models/nutjs-key.model';
import { SettingsModel } from '../models/settings.model';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { SettingsPage } from '../pages/settings/settings';
import { WelcomePage } from '../pages/welcome/welcome';
import { DevicesProvider } from '../providers/devices/devices';
import { ElectronProvider } from '../providers/electron/electron';
import { UtilsProvider } from '../providers/utils/utils';
import { AudioProvider } from '../providers/audio/audio';
import { OutputProfileExportedModel } from '../models/output-profile-exported.model';
import { BtpAlertController } from '../providers/btp-alert-controller/btp-alert-controller';
import { OutputBlockModel } from '../models/output-block.model';
import { TelemetryService } from '../providers/telemetry/telemetry';
import { LicenseProvider } from '../providers/license/license';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  // rootPage: any = SettingsPage;
  rootPage: any = null;
  private loginModal: any = null;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private electronProvider: ElectronProvider,
    private devicesProvider: DevicesProvider,
    private licenseProvider: LicenseProvider,
    private utils: UtilsProvider,
    private translate: TranslateService,
    private audioProvider: AudioProvider,
    private events: Events,
    private app: App,
    private alertCtrl: BtpAlertController,
    private http: Http,
    private markdownService: MarkdownService,
    private modalCtrl: ModalController,
    private telemetryService: TelemetryService,
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
        let outputTemplate: OutputProfileExportedModel;
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

        // Alert
        const warnings = [];
        if (outputTemplate.extras) {
          if (outputTemplate.extras.deleteOtherTemplates) {
            warnings.push('⚠️ All the other templates will be deleted');
          }

          if (outputTemplate.extras.settings != null) {
            warnings.push('⚠️ All your server settings will be overwritten');
          }
        }

        const importTemplateSuccess = await this.utils.text('importTemplateSuccess');

        this.alertCtrl.create({
          title: await this.utils.text('importOutputTemplateDialogTitle'),
          message: await this.utils.text('importOutputTemplateDialogMessage', {
            "templateName": outputTemplate.name,
            "warnings": '<br>' + warnings.join('<br>')
          }),
          buttons: [{
            text: await this.utils.text('importOutputTemplateDialogYesButton'),
            handler: () => {
              this.showRebaseTemplatePathDialog(outputTemplate).then(async (rebasedOutputTemplate) => {
                outputTemplate = rebasedOutputTemplate;

                let settings: SettingsModel = this.electronProvider.store.get(Config.STORAGE_SETTINGS, new SettingsModel(UtilsProvider.GetOS()));
                outputTemplate = this.utils.upgradeTemplate(outputTemplate, outputTemplate.version);

                // Set the new template in the settings object
                if (outputTemplate.extras && outputTemplate.extras.deleteOtherTemplates) {
                  settings.outputProfiles = [outputTemplate];
                } else {
                  // push isn't working, so we're using the spread operator (duplicated issue on the settings.ts file)
                  settings.outputProfiles = [...settings.outputProfiles, outputTemplate];
                }

                // Override the extra settings if are present in the template
                if (outputTemplate.extras && outputTemplate.extras.settings != null) {
                  const settingsToOverride = Object.keys(outputTemplate.extras.settings);
                  for (let key of settingsToOverride) {
                    settings[key] = outputTemplate.extras.settings[key];
                  }
                }

                // Save
                this.electronProvider.store.set(Config.STORAGE_SETTINGS, settings);
                if (ElectronProvider.isElectron()) {
                  this.electronProvider.ipcRenderer.send('settings');
                }

                this.utils.showSuccessNativeDialog(importTemplateSuccess);
              });
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

      const checkDeepLink = (url) => {
        if (url.indexOf('oauth') !== -1) {
          const token = new URL(url).searchParams.get('code');
          this.electronProvider.ipcRenderer.send('oauth_token', token);
        }

        // Handle btplink://success URLs with base64 data parameter
        if (url.indexOf('btplink://success') !== -1) {
          try {
            const urlObj = new URL(url);
            const base64Data = urlObj.searchParams.get('data');
            if (base64Data) {
              const userData = this.utils.processUserAuthentication(base64Data, 'deeplink');

              if (userData) {
                this.utils.showAuthSuccessFeedback(userData);
                console.log('[btplink] User data stored:', userData);
                this.telemetryService.sendEvent('login', null, 'deeplink');

                // Check if serial is provided and activate license
                if (userData.serial) {
                  console.log('[btplink] Serial found, activating license:', userData.serial);
                  this.licenseProvider.updateSubscriptionStatus(userData.serial, false).then(() => {
                    console.log('[btplink] License activation completed');
                  }).catch((error) => {
                    console.error('[btplink] License activation failed:', error);
                  });
                }

                this.closeLoginModalIfOpen();
              }
            }
          } catch (error) {
            console.error('[btplink] Error processing success URL:', error);
          }
        }
      };

      // Used to open files (double click)
      // On Windows when double-clicking, the system passes the file path
      // of the clicked file to the main exectutable.
      const checkArgv = (argv: any[]) => {
        if (argv.length >= 2) { // process.platform == 'win32' &&
          const btptPath = argv.find(x => x.endsWith('.btpt'));
          if (btptPath) {
            this.events.publish('import_btpt', btptPath);
          }

          const oauthUrl = argv.find(x => x.indexOf('oauth') != -1);
          if (oauthUrl) {
            checkDeepLink(oauthUrl);
          }

          // Handle btplink:// URLs from command line
          const btplinkUrl = argv.find(x => x.indexOf('btplink://') != -1);
          if (btplinkUrl) {
            checkDeepLink(btplinkUrl);
          }
        }
      };
      checkArgv(this.electronProvider.processArgv);
      this.electronProvider.ipcRenderer.on('second-instance-open', (event, argv) => {
        checkArgv(argv);
      });

      this.electronProvider.ipcRenderer.on('open-url', (event, url) => {
        checkDeepLink(url);
      });

      this.electronProvider.ipcRenderer.on('incentive_email', (event, argv) => {
        localStorage.setItem('email', argv.email);
        localStorage.setItem('name', argv.name);
        this.audioProvider.playSound('first_connection.mp3');
        this.closeLoginModalIfOpen();
      });
    }); // app.ready

    this.upgrade().then(() => {
      if (!localStorage.getItem('firstConnectionDate')) {
        this.rootPage = WelcomePage;
      } else {
        this.rootPage = HomePage;
      }

      // Check if user authentication is required
      this.checkAuthenticationStatus();
    })

    this.devicesProvider.onConnectedDevicesListChange().subscribe(devicesList => {
      if (devicesList.length != 0) {
        // Check if this is the first connection using localStorage
        const firstConnectionDate = localStorage.getItem('firstConnectionDate');
        if (!firstConnectionDate) {
          this.audioProvider.playSound('first_connection.mp3');
          localStorage.setItem('firstConnectionDate', new Date().getTime().toString());
        }
      }
    });

    // Periodically request a refresh_token for the GSHEET integration
    this.electronProvider.ipcRenderer.on('gsheet_refresh_tokens', (event, tokens) => {
      localStorage.setItem('gsheet_saved_tokens', JSON.stringify(tokens));
    });
    this.electronProvider.ipcRenderer.on('gsheet_get_saved_tokens', (event, tokens) => {
      this.electronProvider.ipcRenderer.send('gsheet_get_saved_tokens', JSON.parse(localStorage.getItem('gsheet_saved_tokens')));
    });
    const requestTokenRefresh = () => {
      const savedTokens = JSON.parse(localStorage.getItem('gsheet_saved_tokens'));
      this.electronProvider.ipcRenderer.send('gsheet_refresh_tokens', savedTokens);
    };
    setInterval(() => { requestTokenRefresh(); }, 1000 * 60 * 60 * 12); // Every 12h
    setTimeout(() => { requestTokenRefresh(); }, 1000 * 60) // After 1 minute the app starts

    this.translate.setDefaultLang('en');

    this.translate.onLangChange.subscribe(event => {
      if (event.lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
      }
    });

    this.translate.use(this.translate.getBrowserLang());

    // Detect first time the window is hidden
    this.electronProvider.ipcRenderer.on('window-hide', () => {
      const hasEverHidden = localStorage.getItem('hasEverHidden');
      localStorage.setItem('hasEverHidden', 'true');
      if (!hasEverHidden) {
        this.electronProvider.ipcRenderer.send('onFirstHide');
      }
    });
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
          for (let i = 0; i < settings.outputProfiles.length; i++) {
            settings.outputProfiles[i] = this.utils.upgradeTemplate(settings.outputProfiles[i], lastVersion);
          }
        }
        if (eq(currentVersion, new SemVer('4.1.0'))) {
          this.utils.showV3DowngradeDialog();
        }

        // v4.3.0
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if ((outputBlock.type == 'function' ||
                outputBlock.type == 'http' ||
                outputBlock.type == 'run' ||
                outputBlock.type == 'csv_lookup' ||
                outputBlock.type == 'csv_update' ||
                outputBlock.type == 'woocommerce') && typeof outputBlock.allowOOBExecution == 'undefined') {
                outputBlock.allowOOBExecution = false;
              }
            });
          })
        }

        // v4.4.0
        // if (typeof settings.demoShown == 'undefined') {
        //   settings.demoShown = false;
        // }

        // v4.6.0
        if (settings.outputProfiles) {
          settings.outputProfiles.forEach(outputProfile => {
            outputProfile.outputBlocks.forEach(outputBlock => {
              if (outputBlock.type == 'text') {
                outputBlock.name = 'STATIC_TEXT';
              }
            });
          })
        }

        // v4.7.0
        if (!settings.autoDelayMs) {
          if (settings.autoDelayMs !== 0) {
            settings.autoDelayMs = 0;
          }
        }
        if (!settings.outputToExcelMode) {
          settings.outputToExcelMode = 'add';
        }

        if (typeof settings.maxScanSessionsNumber == 'undefined') {
          settings.maxScanSessionsNumber = SettingsPage.MAX_SCAN_SESSION_NUMBER_UNLIMITED;
        }

        // v4.8.3
        if (settings.outputProfiles && this.electronProvider.appGetVersion() === '4.8.3') {
          settings.outputProfiles.forEach(outputProfile => {
            // if version was older than v4.8.2
            if (outputProfile.version == null || (outputProfile.version && new SemVer(outputProfile.version).compare('4.8.3') == -1)) {
              for (let outputBlock of outputProfile.outputBlocks) {
                this.utils.mapNutjsKeyToNutjsKeyV482(outputBlock);
              }
              outputProfile.version = this.electronProvider.appGetVersion();
            }
          });
          localStorage.setItem('_upgraaded_nutjs_482', 'true');
        }

        // v4.8.7
        // Migrate first connection date from electron store to localStorage for existing users
        if (!localStorage.getItem('firstConnectionDate')) {
          const existingDate = this.electronProvider.store.get(Config.STORAGE_FIRST_CONNECTION_DATE, 0);
          if (existingDate && existingDate !== 0) {
            localStorage.setItem('firstConnectionDate', existingDate.toString());
          }
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
              outputBlocks.push({ name: 'ENTER', value: '', keyId: NutjsKey.Enter, type: 'key', modifiers: [] });
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

  showRebaseTemplatePathDialog(outputProfile: OutputProfileExportedModel): Promise<OutputProfileExportedModel> {
    if (!outputProfile.extras || !outputProfile.extras.basePath) {
      return new Promise(resolve => { resolve(outputProfile) });
    }

    return new Promise(async resolve => {
      this.utils.showSuccessNativeDialog(await this.utils.text('importOutputTemplateRebaseAlert'));
      const folderPaths = this.electronProvider.showOpenDialogSync({
        title: await this.utils.text('rebaseTemplateDialogTitle'),
        buttonLabel: await this.utils.text('selectCSVSelectButton'),
        defaultPath: this.electronProvider.appGetPath('desktop'),
        properties: ['openDirectory', 'createDirectory', 'promptToCreate',]
      });

      if (folderPaths && folderPaths.length) {
        outputProfile.outputBlocks = outputProfile.outputBlocks.map(x => {
          x.outputImagePath = x.outputImagePath ? x.outputImagePath.replace(outputProfile.extras.basePath, folderPaths[0]) : x.outputImagePath;
          x.csvFile = x.csvFile ? x.csvFile.replace(outputProfile.extras.basePath, folderPaths[0]) : x.csvFile;
          x.value = x.value ? x.value.replace(outputProfile.extras.basePath, folderPaths[0]) : x.value;
          x.outputImagePath = x.outputImagePath ? x.outputImagePath.replace(outputProfile.extras.basePath, folderPaths[0]) : x.outputImagePath;
          return x;
        });
      }
      resolve(outputProfile);
    });
  }

  private checkAuthenticationStatus() {
    // Check if user is authenticated
    const email = localStorage.getItem('email');
    const authSkipped = localStorage.getItem('authSkipped');

    // If user has no email and hasn't skipped authentication, show login page
    if (!email && authSkipped !== 'true') {
      console.log('[app] User not authenticated, showing login page');
      setTimeout(() => {
        this.showLoginPage();
      }, 1000); // Small delay to ensure app is fully loaded
    }
  }

  private showLoginPage() {
    // Prevent opening multiple login modals
    if (this.loginModal) {
      console.log('[app] Login modal already open, skipping');
      return;
    }

    this.loginModal = this.modalCtrl.create(LoginPage, {}, {
      enableBackdropDismiss: false,
      showBackdrop: true
    });

    this.loginModal.onDidDismiss((data) => {
      // Clear the modal reference
      this.loginModal = null;

      if (data && data.authenticated) {
        console.log('[app] User authenticated successfully');
      } else if (data && data.skipped) {
        console.log('[app] User skipped authentication');
      } else if (data && data.dismissedDueToConnectivity) {
        console.log('[app] Login dismissed due to no internet connectivity');
      } else if (data && data.offlineMode) {
        console.log('[app] User chose to continue in offline mode');
      }
    });

    this.loginModal.present();
  }

  private closeLoginModalIfOpen() {
    if (this.loginModal) {
      console.log('[app] Closing login modal due to external authentication');
      this.loginModal.dismiss();
      this.loginModal = null;
    }
  }
}
