import { Component, HostListener, ViewChild } from '@angular/core';
import { Alert, AlertController, Navbar, NavController, NavParams } from 'ionic-angular';
import { DragulaService } from 'ng2-dragula';

import { SettingsModel } from '../../models/settings.model';
import { StringComponentModel } from '../../models/string-component.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { StorageProvider } from '../../providers/storage/storage';

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
  public availableComponents: StringComponentModel[] = this.getAvailableComponents();
  public openAtLogin = false;

  private lastSavedSettings: string;

  private getAvailableComponents(): StringComponentModel[] {
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

      { name: 'TIMESTAMP', value: 'timestamp', type: 'variable' },
      { name: 'DATE', value: 'date', type: 'variable' },
      { name: 'TIME', value: 'time', type: 'variable' },
      { name: 'DATE_TIME', value: 'date_time', type: 'variable' },
      // { name: 'SCAN_INDEX', value: 'scan_index', type: 'variable' },
      { name: 'DEVICE_NAME', value: 'deviceName', type: 'variable' },
      { name: 'delay milliseconds', value: '', type: 'delay', editable: true },

      { name: 'Custom text (click to edit)', value: '', type: 'text', editable: true },

      { name: 'barcode.substr(start, end)', value: 'barcode.substr(start, end)', type: 'function', editable: true },
      { name: 'barcode.replace(searchvalue, newvalue)', value: 'barcode.replace(searchvalue, newvalue)', type: 'function', editable: true },
      { name: 'BARCODE', value: 'BARCODE', type: 'barcode' },
    ];
  }


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private dragulaService: DragulaService,
    private storageProvider: StorageProvider,
    private electronProvider: ElectronProvider,
    private alertCtrl: AlertController,
  ) {
  }

  ionViewDidLoad() {
    this.dragulaService.drop.subscribe(value => {
      if (value[3].className.indexOf('components-available') != -1) {
        this.availableComponents = this.getAvailableComponents();
      }
    });

    this.dragulaService.out.subscribe(value => {
      if (value[3].className.indexOf('components-typed') != -1) {
        this.dragulaService.find('components').drake.remove();
      }
    });

    this.settings = this.storageProvider.getSettings();

    if (this.electronProvider.isElectron()) {
      this.openAtLogin = this.electronProvider.app.getLoginItemSettings().openAtLogin;
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

  apply() {
    this.storageProvider.setSettings(this.settings);
    this.setOpenAtLogin(this.openAtLogin);
    this.lastSavedSettings = JSON.stringify(this.settings);
    if (this.electronProvider.isElectron()) {
      this.electronProvider.ipcRenderer.send('settings', this.settings);
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
              this.apply();
              this.navCtrl.pop();
            }
          }
        ]
      });
      this.unsavedSettingsAlert.present();
    }
  }

  private setOpenAtLogin(openAtLogin) {
    if (this.electronProvider.isElectron()) {
      this.electronProvider.app.setLoginItemSettings({ openAtLogin: openAtLogin })
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log('esc');
    if (event.keyCode == 27 && !this.unsavedSettingsAlert && this.electronProvider.isDev) { // esc 
      this.goBack();
    }
  }
}
