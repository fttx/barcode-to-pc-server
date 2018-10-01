import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ElectronProvider } from '../electron/electron';
import { Config } from '../../../../electron/src/config';
import { DeviceModel } from '../../models/device.model';
import { AlertController, AlertOptions } from 'ionic-angular';

/**
 * LicenseProvider comunicates with the subscription-server to see if there is
 * an active subscription for the current machine.
 * LicenseProvider provides methods to see wheter a certain feature can be
 * accessed with the active subscription plan.
 * It also provides methods to show to the user license related messages/pages.
 */
@Injectable()
export class LicenseProvider {
  public static SUBSCRIPTION_FREE = 0;
  public static SUBSCRIPTION_BASIC = 1;
  public static SUBSCRIPTION_PRO = 2;
  public static SUBSCRIPTION_UNLIMITED = 3;

  private activeSubscription = LicenseProvider.SUBSCRIPTION_FREE;

  constructor(
    public http: HttpClient,
    private electronProvider: ElectronProvider,
    private alertCtrl: AlertController,
  ) {

  }

  /**
   * This method finds out if there is an active subscription for the current
   * machine and saves it locally. 
   * Once it has been executed the other methods of this class will return the
   * corresponding max allowed values for the active subscription plan (eg.
   * getMaxComponentsNumber will return different values based on the active
   * subscription).
   * This method should be called as soon as the app starts
   */
  updateSubscriptionStatus() {
    // First check if there is a saved subscription in the storage
    // After that contact asyncronusly the subscription-server and fetch the
    // subscription data

    // let store = new this.electronProvider.ElectronStore();
    // store.set('unicorn', '🦄');
    // console.log(store.get('unicorn'));

    // http.get('url', {}).subscribe(value => {

    // });
  }

  showPricingPage() {
    let uiniqueId = this.getUniqueId();
    this.electronProvider.shell.openExternal(Config.URL_PRICING + '?uniqueId=' + uiniqueId);
  }

  /**
   * This function must to be called when a new device is connected.
   * It will check if the limit is reached and will show the appropriate
   * messages on both server and app
   * @param device 
   * @param connectedDevices 
   */
  limitNOMaxConnectedDevices(device: DeviceModel, connectedDevices: DeviceModel[]) {
    if (connectedDevices.length > this.getNOMaxConnectedDevices()) {
      device.kicked = true;
      this.electronProvider.ipcRenderer.send('kick', device.deviceId);
      this.showSubscribeDialog('Devices limit raeched', 'You\'ve reached the maximum number of connected devices, please subscribe')
    }
  }

  getNOMaxComponents() {
    switch (this.activeSubscription) {
      case LicenseProvider.SUBSCRIPTION_FREE: return 4;
      case LicenseProvider.SUBSCRIPTION_BASIC: return 7;
      case LicenseProvider.SUBSCRIPTION_PRO: return 10;
      case LicenseProvider.SUBSCRIPTION_UNLIMITED: return Number.MAX_SAFE_INTEGER;
    }
  }

  getNOMaxConnectedDevices() {
    switch (this.activeSubscription) {
      case LicenseProvider.SUBSCRIPTION_FREE: return 1;
      case LicenseProvider.SUBSCRIPTION_BASIC: return 2;
      case LicenseProvider.SUBSCRIPTION_PRO: return 10;
      case LicenseProvider.SUBSCRIPTION_UNLIMITED: return Number.MAX_SAFE_INTEGER;
    }
  }

  private showSubscribeDialog(title, message) {
    this.alertCtrl.create({
      title: title, message: message, buttons: [{ text: 'Close', role: 'cancel' }, {
        text: 'Subscribe', handler: (opts: AlertOptions) => {
          this.showPricingPage();
        }
      }]
    }).present();
  }

  private getUniqueId(): string {
    return '';
  }
}
