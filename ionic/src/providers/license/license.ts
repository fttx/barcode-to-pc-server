import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, AlertOptions } from 'ionic-angular';

import { Config } from '../../../../electron/src/config';
import { DeviceModel } from '../../models/device.model';
import { ElectronProvider } from '../electron/electron';
import { UtilsProvider } from '../utils/utils';

/**
 * LicenseProvider comunicates with the subscription-server to see if there is
 * an active subscription for the current machine. (The check is done on app
 * start in the constructor)
 * LicenseProvider provides methods to see wheter a certain feature can be
 * accessed with the active subscription plan.
 * It also provides methods to show to the user license related messages/pages.
 */
@Injectable()
export class LicenseProvider {
  public static PLAN_FREE = 'barcode-to-pc-free';
  public static PLAN_BASIC = 'barcode-to-pc-basic';
  public static PLAN_PRO = 'barcode-to-pc-pro';
  public static PLAN_UNLIMITED = 'barcode-to-pc-unlimited';

  public plan = LicenseProvider.PLAN_FREE;
  public serial = '';

  constructor(
    public http: HttpClient,
    private electronProvider: ElectronProvider,
    private alertCtrl: AlertController,
    private utilsProvider: UtilsProvider
  ) {
    this.updateSubscriptionStatus();
  }

  /**
   * This method finds out if there is an active subscription for the current
   * machine and saves it locally by contacting the btp-license-server. 
   * 
   * Once it has been executed the other methods of this class will return the
   * corresponding max allowed values for the active subscription plan (eg.
   * getMaxComponentsNumber will return different values based on the active
   * subscription).
   * 
   * This method should be called as soon as the app starts
   * 
   * If no serial is passed it'll try to load it from the storage and silently
   * perform the checks
   * 
   * If the serial is passed it'll prompt the user with dialogs
   */
  updateSubscriptionStatus(serial: string = '') {
    let store = new this.electronProvider.ElectronStore();
    this.plan = store.get(Config.STORAGE_SUBSCRIPTION, LicenseProvider.PLAN_FREE)
    // store.delete(Config.STORAGE_SUBSCRIPTION);

    if (serial) {
      this.serial = serial;
      store.set(Config.STORAGE_SERIAL, this.serial);
    } else {
      this.serial = store.get(Config.STORAGE_SERIAL, '')
    }

    // Do not bother the license-server if there isn't an active subscription
    if (serial == '' && this.plan == LicenseProvider.PLAN_FREE) {
      return;
    }

    this.http.post(Config.URL_CHECK_SUBSCRIPTION, {
      serial: this.serial,
      uuid: this.electronProvider.uuid
    }).subscribe(value => {
      store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
      if (value['active'] == true) {

        // The first time that the request is performed the license-server will
        // do a CLAIM procedure that doesn't return the plan name. From the
        // second request on it will respond also with the active plan name.
        if (!value['plan']) {
          // If the plan name isn't in the response it means that this was the
          // first request and that the CLAIM procedure has been executed
          // successfully, so i can do a second request to retreive the plan name
          this.updateSubscriptionStatus(serial);
        } else {
          this.plan = value['plan'];
          store.set(Config.STORAGE_SUBSCRIPTION, this.plan);
          if (serial) {
            this.utilsProvider.showSuccessNativeDialog('The license has been activated successfully')
          }         
        }
      } else {
        // When the license-server says that the subscription is not active
        // the user should be propted immediatly, no matter what it's passed a
        // serial
        this.deactivate();
        this.utilsProvider.showErrorNativeDialog(value['message']);
      }
    }, (error: HttpErrorResponse) => {
      if (serial) {
        if (error.status == 503) {
          this.utilsProvider.showErrorNativeDialog('Unable to fetch the subscription information, try later (FS problem)');
        } else {
          this.utilsProvider.showErrorNativeDialog('Unable to activate the license. Please make you sure that your internet connection is active and try again. If the error persists please contact the support.');
        }
      } else {
        // Perhaps there is a connection problem, wait a month before asking the
        // user to enable the connection.
        // For simplicty the STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE field is used
        // only within this method
        let firstFailDate = store.get(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
        let now = new Date().getTime();
        if (firstFailDate && (now - firstFailDate) > 2592000000) { // 1 month = 2592000000 ms
          store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
          this.deactivate();
          this.utilsProvider.showErrorNativeDialog('Unable to verify your subscription plan. Please make you sure that the computer has an active internet connection');
        } else {
          store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, now);
        }
      }
    })
  }

  deactivate(clearSerial = false) {
    let store = new this.electronProvider.ElectronStore();
    if (clearSerial) {
      this.serial = '';
      store.set(Config.STORAGE_SERIAL, this.serial);
    }
    this.plan = LicenseProvider.PLAN_FREE;
    store.set(Config.STORAGE_SUBSCRIPTION, this.plan);
  }

  showPricingPage() {
    this.electronProvider.shell.openExternal(Config.URL_PRICING);
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
    switch (this.plan) {
      case LicenseProvider.PLAN_FREE: return 4;
      case LicenseProvider.PLAN_BASIC: return 7;
      case LicenseProvider.PLAN_PRO: return 10;
      case LicenseProvider.PLAN_UNLIMITED: return Number.MAX_SAFE_INTEGER;
    }
  }

  getNOMaxConnectedDevices() {
    switch (this.plan) {
      case LicenseProvider.PLAN_FREE: return 1;
      case LicenseProvider.PLAN_BASIC: return 2;
      case LicenseProvider.PLAN_PRO: return 10;
      case LicenseProvider.PLAN_UNLIMITED: return Number.MAX_SAFE_INTEGER;
    }
  }

  isActived() {
    return this.plan != LicenseProvider.PLAN_FREE;
  }

  getPlanName() {
    switch (this.plan) {
      case LicenseProvider.PLAN_FREE: return 'Free';
      case LicenseProvider.PLAN_BASIC: return 'Basic';
      case LicenseProvider.PLAN_PRO: return 'Pro';
      case LicenseProvider.PLAN_UNLIMITED: return 'Unlimited'
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
}