import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Config } from '../../../../electron/src/config';
import { HttpClient } from '@angular/common/http';
import { ElectronProvider } from '../../providers/electron/electron';
import ElectronStore from 'electron-store'


/**
 * Generated class for the ActivatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-activate',
  templateUrl: 'activate.html',
})
export class ActivatePage {
  public uuid = '';

  public serial = '';
  public activated = false;

  private store: ElectronStore;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
    public http: HttpClient,
  ) {
    this.store = new this.electronProvider.ElectronStore();
    this.activated = this.store.get(Config.STORAGE_ACTIVATED, false)
    this.serial = this.store.get(Config.STORAGE_SERIAL, '')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ActivatePage');
  }

  close() {
    this.viewCtrl.dismiss();
  }

  getPricingUrl() {
    return Config.URL_PRICING;
  }

  onCheckActivationClick() {
    this.http.post(Config.URL_CHECK_SUBSCRIPTION, {
      serial: this.serial,
      uuid: this.electronProvider.uuid
    }).subscribe(value => {
      if (value['active'] == true) {
        this.activated = true;
        this.store.set(Config.STORAGE_ACTIVATED, this.activated);
        this.store.set(Config.STORAGE_SERIAL, this.serial);
        this.electronProvider.dialog.showMessageBox(null, {
          type: 'info', title: 'Success', buttons: ['Close'], message: 'The license has been activated successfully'
        })
      } else {
        this.showLicenseErrorDialog(value['message']);
      }
      // console.log(value);
    }, error => {
      this.showLicenseErrorDialog('Unable to activate the license. Please make you sure that your internet connection is active and try again. If the error persists please contact the support.');
    })
  }

  onDeactivateClick() {
    // TODO: send the user an e-mail with a token and only when the e-mail is
    // verified deactivate the license
    // Alternatively do it manually with human support
    // this.activated = false;
    // this.serial = '';
    // this.store.set(Config.STORAGE_ACTIVATED, this.activated);
    // this.store.set(Config.STORAGE_SERIAL, this.serial);
  }

  private showLicenseErrorDialog(message: string = '') {
    this.electronProvider.dialog.showMessageBox(null, { // this.electronProvider.remote.getCurrentWindow()
      type: 'error', title: 'Error', buttons: ['Close'], message: message,
    })
  }
}
