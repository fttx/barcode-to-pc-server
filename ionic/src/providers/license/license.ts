import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import ElectronStore from 'electron-store';
import { Alert, AlertController, AlertOptions } from 'ionic-angular';
import { Config } from '../../../../electron/src/config';
import { DeviceModel } from '../../models/device.model';
import { DevicesProvider } from '../devices/devices';
import { ElectronProvider } from '../electron/electron';
import { StorageProvider } from '../storage/storage';
import { UtilsProvider } from '../utils/utils';
import { SettingsModel } from '../../models/settings.model';


/**
 * LicenseProvider comunicates with the subscription-server to see if there is
 * an active subscription for the current machine. (The check is done on app
 * start in the constructor)
 *
 * LicenseProvider provides methods to see wheter a certain feature can be
 * accessed with the active subscription plan like getNOMaxX or canUseX.
 *
 * Methods that looks like limitFeatureX must be called when the user tries to
 * use an X paid feature. These methods take care of disabling the feature for
 * the future use and inform the user about it through dialogs.
 *
 * LicenseProvider also provides other methods to show to the user
 * license-related dialogs and pages. 
 *
 * // TODO: remove StorageProvider and use only ElectronStore, this way should
 * be possible to convert all methods that looks like canUseX to limitFeatureX
 * so that this class can encapsulate all license related code
 */
@Injectable()
export class LicenseProvider {
  public static PLAN_FREE = 'barcode-to-pc-free';
  public static PLAN_BASIC = 'barcode-to-pc-basic';
  public static PLAN_PRO = 'barcode-to-pc-pro';
  public static PLAN_UNLIMITED = 'barcode-to-pc-unlimited';

  public activePlan = LicenseProvider.PLAN_FREE;
  public serial = '';

  private store: ElectronStore;
  private upgradeDialog: Alert = null;

  constructor(
    public http: HttpClient,
    private electronProvider: ElectronProvider,
    private alertCtrl: AlertController,
    private utilsProvider: UtilsProvider,
    private storageProvider: StorageProvider, // deprecated, use ElectronStore
    private devicesProvider: DevicesProvider,
  ) {
    this.store = new this.electronProvider.ElectronStore();
    this.updateSubscriptionStatus();
    this.devicesProvider.onConnectedDevicesListChange().subscribe(devicesList => {
      let lastDevice = devicesList[devicesList.length - 1];
      this.limitNOMaxConnectedDevices(lastDevice, devicesList);
    })

    this.devicesProvider.onDeviceDisconnect().subscribe(device => {
      if (this.activePlan == LicenseProvider.PLAN_FREE) {
        this.showUpgradeDialog('commercialUse', 'Free plan', 'Your current plan is for non-commercial use only. Please subscribe to a paid plan if you are using Barcode to PC for commercial purposes')
      }
    })

    this.devicesProvider.onDeviceConnect().subscribe(device => {
      this.hideUpgradeDialog();
    })

    // if it's the first app start, initialize nextChargeDate and lastScanCountResetDate
    let nextChargeDate = this.store.get(Config.STORAGE_NEXT_CHARGE_DATE, null);
    if (nextChargeDate === null) { // happens only on the first start
      this.store.set(Config.STORAGE_NEXT_CHARGE_DATE, new Date().getTime() + 1000 * 60 * 60 * 24 * 31); // NOW() + 1 month
      this.store.set(Config.STORAGE_LAST_SCAN_COUNT_RESET_DATE, 0); // 0 = past moment
    }
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
    this.activePlan = this.store.get(Config.STORAGE_SUBSCRIPTION, LicenseProvider.PLAN_FREE)

    if (serial) {
      this.serial = serial;
      this.store.set(Config.STORAGE_SERIAL, this.serial);
    } else {
      this.serial = this.store.get(Config.STORAGE_SERIAL, '')
    }

    let now = new Date().getTime();
    let nextChargeDate = this.store.get(Config.STORAGE_NEXT_CHARGE_DATE);
    let canResetScanCount = now > nextChargeDate;

    if (this.activePlan == LicenseProvider.PLAN_FREE && canResetScanCount) {
      this.store.set(Config.STORAGE_MONTHLY_SCAN_COUNT, 0);
      this.store.set(Config.STORAGE_NEXT_CHARGE_DATE, new Date().getTime() + 1000 * 60 * 60 * 24 * 31); // NOW() + 1 month      
    }

    // Do not bother the license-server if there isn't an active subscription
    if (serial == '' && this.serial == '' && this.activePlan == LicenseProvider.PLAN_FREE) {
      // it's also required to check this.serial == '' because when there isn't
      // a internet connection the plan gets downgraded but the serial is
      // still saved to the storage
      return;
    }

    this.http.post(Config.URL_SUBSCRIPTION_CHECK, {
      serial: this.serial,
      uuid: this.electronProvider.uuid
    }).subscribe(value => {
      this.store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
      if (value['active'] == true) {

        // The first time that the request is performed the license-server will
        // do a CLAIM procedure that doesn't return the plan name. From the
        // second request on it will respond also with the active plan name.
        if (!value['plan']) {
          // If the plan name isn't in the response it means that this was the
          // first request and that the CLAIM procedure has been executed
          // successfully, so i can do a second request to retreive the plan name.
          this.updateSubscriptionStatus(serial);
        } else {
          this.activePlan = value['plan'];
          this.store.set(Config.STORAGE_SUBSCRIPTION, value['plan']);
          this.store.set(Config.STORAGE_NEXT_CHARGE_DATE, value['nextChargeDate']);
          if (serial) {
            this.utilsProvider.showSuccessNativeDialog('The license has been activated successfully')
          }
          if (canResetScanCount) {
            this.store.set(Config.STORAGE_MONTHLY_SCAN_COUNT, 0);
          }
        }
      } else {
        // When the license-server says that the subscription is not active
        // the user should be propted immediatly, no matter what is passed a
        // serial or not.
        this.deactivate();
        this.utilsProvider.showErrorNativeDialog(value['message']);
      }
    }, (error: HttpErrorResponse) => {
      if (serial) {
        if (error.status == 503) {
          this.utilsProvider.showErrorNativeDialog('Unable to fetch the subscription information, try later (FS problem)');
        } else {
          this.deactivate();
          this.utilsProvider.showErrorNativeDialog('Unable to activate the license. Please make you sure that your internet connection is active and try again. If the error persists please contact the support.');
        }
      } else {
        // Perhaps there is a connection problem, wait 15 days before asking the
        // user to enable the connection.
        // For simplicty the STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE field is used
        // only within this method
        let firstFailDate = this.store.get(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
        let now = new Date().getTime();
        if (firstFailDate && (now - firstFailDate) > 1296000000) { //  15 days = 1296000000 ms
          this.store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
          this.deactivate();
          this.utilsProvider.showErrorNativeDialog('Unable to verify your subscription plan. Please make you sure that the computer has an active internet connection');
        } else {
          this.store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, now);
        }
      }
    })
  } // updateSubscriptionStatus

  /**
   * Resets the subscription plan to FREE.
   * 
   * @param clearSerial If TRUE the serial number is removed from the storage.
   * The serial should be cleared only if the user explicitely deactivates the
   * plan from the UI. 
   * 
   * In all other cases clearSerial should always be set to FALSE in order to
   * give the system the opportunity to reactivate itself when for example the
   * connection comes back on after that the system wasn't able to contact the
   * license server, or even when the subscription fails to renew and the user
   * updates his payment information.
   * 
   * When clearSerial is TRUE it's required an internet connection to complete
   * the deactivation process.
   */
  deactivate(clearSerial = false) {
    let downgradeToFree = () => {
      this.activePlan = LicenseProvider.PLAN_FREE;
      this.store.set(Config.STORAGE_SUBSCRIPTION, this.activePlan);

      let settings = this.storageProvider.getSettings();
      if (!this.canUseCSVAppend(false)) {
        settings.appendCSVEnabled = false;
      }
      if (!this.canUseQuantityParameter(false)) {
        settings.typedString = settings.typedString.filter(x => x.value != 'quantity');
      }
      this.storageProvider.setSettings(settings);
    }

    if (clearSerial) {
      this.http.post(Config.URL_SUBSCRIPTION_DEACTIVATE, {
        serial: this.serial,
        uuid: this.electronProvider.uuid
      }).subscribe(value => {
        downgradeToFree();
        this.serial = '';
        this.store.set(Config.STORAGE_SERIAL, this.serial);
      }, (error: HttpErrorResponse) => {
        this.utilsProvider.showErrorNativeDialog('Unable to deactivate your subscription plan. Please make you sure that the computer has an active internet connection');
      });
    } else {
      downgradeToFree();
    }
  }

  showPricingPage(refer) {
    // customTypedString
    let customTypedString = false;
    let settings = this.storageProvider.getSettings();
    if (settings.typedString.length != 2 || settings.typedString.length >= 3) {
      customTypedString = true;
    } else if (settings.typedString.length == 2) {
      let defaultSettings = new SettingsModel();
      customTypedString = (settings.typedString[0].value != defaultSettings.typedString[0].value || settings.typedString[1].value != defaultSettings.typedString[1].value);
    }

    // scanLimitReached
    let scanLimitReached =
      this.getNOMaxAllowedScansPerMonth() - this.store.get(Config.STORAGE_MONTHLY_SCAN_COUNT, 0) <= 0;

    // periodOfUseSinceFirstConnection
    let periodOfUseSinceFirstConnection = 'days';
    let days = parseInt(
      ((new Date().getTime() - this.store.get(Config.STORAGE_FIRST_CONNECTION_DATE, 0)) / 86400000) + ''
    );
    if (days >= 7) {
      periodOfUseSinceFirstConnection = 'weeks';
    }
    if (days >= 31) {
      periodOfUseSinceFirstConnection = 'months';
    }
    if (days >= 365) {
      periodOfUseSinceFirstConnection = 'years';
    }

    // Put everything together and open the url in the system browser
    this.electronProvider.shell.openExternal(
      this.utilsProvider.appendParametersToURL(Config.URL_PRICING, {
        currentPlan: this.activePlan,
        customTypedString: customTypedString,
        scanLimitReached: scanLimitReached,
        periodOfUseSinceFirstConnection: periodOfUseSinceFirstConnection,
        refer: refer,
      })
    );
  }

  /**
   * This method must to be called when a new device is connected.
   * It will check if the limit is reached and will show the appropriate
   * messages on both server and app
   */
  limitNOMaxConnectedDevices(device: DeviceModel, connectedDevices: DeviceModel[]) {
    if (connectedDevices.length > this.getNOMaxAllowedConnectedDevices()) {
      let message = 'You\'ve reached the maximum number of connected devices for your current subscription plan';
      this.devicesProvider.kickDevice(device, message);
      this.showUpgradeDialog('limitNOMaxConnectedDevices', 'Devices limit reached', message)
    }
  }

  /**
   * This method should be called when retrieving a set of new scans.
   * It kicks out all devices and shows a dialog when the monthly limit of scans
   * has been exceeded
   */
  limitMonthlyScans(noNewScans = 1) {
    let count = this.store.get(Config.STORAGE_MONTHLY_SCAN_COUNT, 0);
    count += noNewScans;
    this.store.set(Config.STORAGE_MONTHLY_SCAN_COUNT, count);

    if (count > this.getNOMaxAllowedScansPerMonth()) {
      let message = 'You\'ve reached the maximum number of monthly scannings for your current subscription plan.';
      this.devicesProvider.kickAllDevices(message);
      this.showUpgradeDialog('limitMonthlyScans', 'Monthly scans limit reached', message)
    }
  }

  /**
   * Shuld be called when the user tries to drag'n drop the quantity component.
   * @returns FALSE if the feature should be limited
   */
  canUseQuantityParameter(showUpgradeDialog = true): boolean {
    let available = false;
    switch (this.activePlan) {
      case LicenseProvider.PLAN_FREE: available = false; break;
      case LicenseProvider.PLAN_BASIC: available = true; break;
      case LicenseProvider.PLAN_PRO: available = true; break;
      case LicenseProvider.PLAN_UNLIMITED: available = true; break;
    }

    if (!available && showUpgradeDialog) {
      this.showUpgradeDialog('canUseQuantityParameter', 'Upgrade', 'This feature isn\'t available with your current subscription plan.');
    }
    return available;
  }

  /**
   * Shuld be called when the user tries to enable the CSV append option
   * @returns FALSE if the feature should be limited
   */
  canUseCSVAppend(showUpgradeDialog = false): boolean {
    let available = false;
    switch (this.activePlan) {
      case LicenseProvider.PLAN_FREE: available = false; break;
      case LicenseProvider.PLAN_BASIC: available = true; break;
      case LicenseProvider.PLAN_PRO: available = true; break;
      case LicenseProvider.PLAN_UNLIMITED: available = true; break;
    }
    if (!available && showUpgradeDialog) {
      this.showUpgradeDialog('canUseCSVAppend', 'Upgrade', 'This feature isn\'t available with your current subscription plan.');
    }
    return available;
  }

  getNOMaxComponents() {
    switch (this.activePlan) {
      case LicenseProvider.PLAN_FREE: return 4;
      case LicenseProvider.PLAN_BASIC: return 5;
      case LicenseProvider.PLAN_PRO: return 10;
      case LicenseProvider.PLAN_UNLIMITED: return Number.MAX_SAFE_INTEGER;
    }
  }

  getNOMaxAllowedConnectedDevices() {
    switch (this.activePlan) {
      case LicenseProvider.PLAN_FREE: return 1;
      case LicenseProvider.PLAN_BASIC: return 1;
      case LicenseProvider.PLAN_PRO: return 3;
      case LicenseProvider.PLAN_UNLIMITED: return Number.MAX_SAFE_INTEGER;
    }
  }

  getNOMaxAllowedScansPerMonth() {
    switch (this.activePlan) {
      case LicenseProvider.PLAN_FREE: return 1000;
      case LicenseProvider.PLAN_BASIC: return 2000;
      case LicenseProvider.PLAN_PRO: return 10000;
      case LicenseProvider.PLAN_UNLIMITED: return Number.MAX_SAFE_INTEGER;
    }
  }

  isSubscribed() {
    return this.activePlan != LicenseProvider.PLAN_FREE;
  }

  getPlanName() {
    switch (this.activePlan) {
      case LicenseProvider.PLAN_FREE: return 'Free';
      case LicenseProvider.PLAN_BASIC: return 'Basic';
      case LicenseProvider.PLAN_PRO: return 'Pro';
      case LicenseProvider.PLAN_UNLIMITED: return 'Unlimited'
    }
  }

  private showUpgradeDialog(refer, title, message) {
    if (this.upgradeDialog != null) {
      return;
    }
    this.upgradeDialog = this.alertCtrl.create({
      title: title, message: message, buttons: [{ text: 'Close', role: 'cancel' }, {
        text: 'Upgrade', handler: (opts: AlertOptions) => {
          this.showPricingPage(refer + 'Dialog');
        }
      }]
    });
    this.upgradeDialog.onDidDismiss(() => this.upgradeDialog = null)
    this.upgradeDialog.present();
  }

  private hideUpgradeDialog() {
    if (this.upgradeDialog != null) {
      this.upgradeDialog.dismiss();
    }
  }
}