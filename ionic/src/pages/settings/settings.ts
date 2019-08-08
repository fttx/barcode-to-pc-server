import { Component, HostListener, ViewChild, NgZone } from '@angular/core';
import ElectronStore from 'electron-store';
import { Alert, AlertController, Navbar, NavController, NavParams, AlertButton } from 'ionic-angular';
import { DragulaService } from "ng2-dragula";
import { Config } from '../../../../electron/src/config';
import { SettingsModel } from '../../models/settings.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { LicenseProvider } from '../../providers/license/license';
import { OutputBlockModel } from '../../models/output-block.model';
import { OutputProfileModel } from '../../models/outputProfile.model';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  @ViewChild(Navbar) navBar: Navbar;

  public unsavedSettingsAlert: Alert;
  public settings: SettingsModel = new SettingsModel();
  public availableOutputBlocks: OutputBlockModel[] = this.getAvailableOutputBlocks();
  public openAutomatically: ('yes' | 'no' | 'minimized') = 'yes';

  private lastSavedSettings: string;
  private store: ElectronStore;


  private getAvailableOutputBlocks(): OutputBlockModel[] {
    return [
      { name: 'BACKSPACE', value: 'backspace', type: 'key' },
      { name: 'DELETE', value: 'delete', type: 'key' },
      { name: 'ALT', value: 'ALT', type: 'key' },
      { name: 'ENTER', value: 'enter', type: 'key' },
      { name: 'TAB', value: 'tab', type: 'key' },
      { name: 'ESCAPE', value: 'escape', type: 'key' },
      { name: '&uarr;', value: 'up', type: 'key' },
      { name: '&rarr;', value: 'right', type: 'key' },
      { name: '&darr;', value: 'down', type: 'key' },
      { name: '&larr;', value: 'left', type: 'key' },
      { name: 'HOME', value: 'home', type: 'key' },
      { name: 'END', value: 'end', type: 'key' },
      { name: 'PAGEUP', value: 'pageup', type: 'key' },
      { name: 'PAGEDOWN', value: 'pagedown', type: 'key' },
      { name: 'COMMAND', value: 'command', type: 'key' },
      { name: 'ALT', value: 'alt', type: 'key' },
      { name: 'CONTROL', value: 'control', type: 'key' },
      { name: 'SHIFT', value: 'shift', type: 'key' },
      { name: 'RIGHT_SHIFT', value: 'right_shift', type: 'key' },
      { name: 'SPACE', value: 'space', type: 'key' },
      { name: 'Other key (click to edit)', value: '', type: 'key', editable: true },

      { name: 'TIMESTAMP', value: 'timestamp', type: 'variable' },
      { name: 'DATE', value: 'date', type: 'variable' },
      { name: 'TIME', value: 'time', type: 'variable' },
      { name: 'DATE_TIME', value: 'date_time', type: 'variable' },
      // { name: 'SCAN_INDEX', value: 'scan_index', type: 'variable' },
      { name: 'DEVICE_NAME', value: 'deviceName', type: 'variable' },
      { name: 'QUANTITY', value: 'quantity', type: 'variable' },
      { name: 'delay milliseconds', value: '', type: 'delay', editable: true },

      { name: 'Custom text (click to edit)', value: '', type: 'text', editable: true },

      { name: 'Custom function', value: '', type: 'function', editable: true },
      { name: 'IF', value: 'if', type: 'if', editable: true },
      { name: 'ENDIF', value: 'endif', type: 'endif' },
      { name: 'BARCODE', value: 'BARCODE', type: 'barcode' },
    ];
  }


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private dragulaService: DragulaService,
    private electronProvider: ElectronProvider,
    private licenseProvider: LicenseProvider,
    private alertCtrl: AlertController,
    private ngZone: NgZone,
  ) {
    this.store = new this.electronProvider.ElectronStore();
    this.dragulaService.destroy('dragula-group')
    this.dragulaService.createGroup('dragula-group', {
      copy: (el, source) => {
        return source.id === 'left';
      },
      accepts: (el, target, source, sibling) => {
        // To avoid dragging from right to left container
        return target.id !== 'left';
      },
      copyItem: (item: OutputBlockModel) => {
        return JSON.parse(JSON.stringify(item));
      },
      removeOnSpill: true
    });

    this.dragulaService.dropModel('dragula-group').subscribe(({ name, el, target, source, sibling, item, sourceModel, targetModel, }) => {
      if (item.value == 'quantity') {
        if (!this.licenseProvider.canUseQuantityParameter(true)) {
          setTimeout(() => this.settings.outputProfiles[0].outputBlocks = this.settings.outputProfiles[0].outputBlocks.filter(x => x.value != 'quantity'), 1000)
        }
      }
    });
  }

  public getAppName() {
    return Config.APP_NAME;
  }

  public canAddMoreComponents() {
    return this.settings.outputProfiles[0].outputBlocks.length < this.licenseProvider.getNOMaxComponents();
  }

  public onSubscribeClick() {
    this.licenseProvider.showPricingPage('customOutputFieldOnSubscribeClick');
  }

  ionViewDidLoad() {
    this.settings = this.store.get(Config.STORAGE_SETTINGS, new SettingsModel());

    if (this.electronProvider.isElectron()) {
      let openAtLogin = this.electronProvider.app.getLoginItemSettings().openAtLogin;
      let openAsHidden = this.electronProvider.app.getLoginItemSettings().openAsHidden;

      if (openAsHidden) {
        this.openAutomatically = 'minimized';
      } else if (openAtLogin) {
        this.openAutomatically = 'yes';
      } else {
        this.openAutomatically = 'no';
      }
    }

    this.lastSavedSettings = JSON.stringify(this.settings);

    this.navBar.backButtonClick = (e: UIEvent) => {
      this.goBack();
    }
  }

  // willExit -> apply

  onApplyClick() {
    this.apply();
  }

  onRestoreDefaultSettingsClick() {
    this.settings = new SettingsModel();
    this.openAutomatically = 'no'
    this.apply();
  }

  apply(pop = false) {
    let noIfs = this.settings.outputProfiles[0].outputBlocks.filter(x => x.type == 'if').length;
    let noEndIfs = this.settings.outputProfiles[0].outputBlocks.filter(x => x.type == 'endif').length;
    if (noIfs != noEndIfs) {
      let buttons: AlertButton[] = [{ text: 'OK', role: 'cancel', },];
      if (pop) {
        buttons.unshift({ text: 'Discard', handler: () => { this.navCtrl.pop(); } });
      }
      this.alertCtrl.create({
        title: 'Syntax error',
        message: 'The number of IF output blocks should be the same of the ENDIF',
        buttons: buttons
      }).present();
      return false;
    }

    this.store.set(Config.STORAGE_SETTINGS, this.settings);
    if (this.electronProvider.isElectron()) {
      this.electronProvider.app.setLoginItemSettings({
        openAtLogin: (this.openAutomatically == 'yes' || this.openAutomatically == 'minimized'),
        openAsHidden: this.openAutomatically == 'minimized'
      })
    }
    this.lastSavedSettings = JSON.stringify(this.settings);
    if (this.electronProvider.isElectron()) {
      this.electronProvider.ipcRenderer.send('settings');
    }

    if (pop) {
      this.navCtrl.pop();
    }
  }

  goBack() {
    if (this.lastSavedSettings == JSON.stringify(this.settings)) { // settings up to date
      this.navCtrl.pop();
    } else { // usnaved settings
      this.unsavedSettingsAlert = this.alertCtrl.create({
        title: 'Unsaved settings',
        message: 'Do you want to save and apply the settings?',
        buttons: [
          {
            text: 'Discard',
            role: 'cancel',
            handler: () => {
              this.navCtrl.pop();
            }
          },
          {
            text: 'Save & Apply',
            handler: () => {
              this.apply(true);
            }
          }
        ]
      });
      this.unsavedSettingsAlert.present();
    }
  }

  onSelectCSVPathClick() {
    let defaultPath = this.settings.csvPath;
    if (!defaultPath) {
      defaultPath = this.electronProvider.app.getPath('desktop')
    }

    let filePaths = this.electronProvider.dialog.showOpenDialog(this.electronProvider.remote.getCurrentWindow(), {
      title: 'Select the CSV file path',
      buttonLabel: 'Select',
      defaultPath: defaultPath,
      filters: [
        { name: 'Text files', extensions: ['txt', 'csv', 'log'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile', 'createDirectory', 'promptToCreate',]
    });

    if (filePaths && filePaths.length) {
      this.settings.csvPath = filePaths[0];
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log('esc');
    if (event.keyCode == 27 && !this.unsavedSettingsAlert && this.electronProvider.isDev) { // esc
      this.goBack();
    }
  }

  onCSVClick() {
    if (this.settings.appendCSVEnabled) {
      if (!this.licenseProvider.canUseCSVAppend(true)) {
        setTimeout(() => this.settings.appendCSVEnabled = false, 1000)
      }
    }
  }
}
