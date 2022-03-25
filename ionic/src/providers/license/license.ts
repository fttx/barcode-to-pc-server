import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Alert, AlertController, AlertOptions, Events } from 'ionic-angular';
import { interval } from 'rxjs/observable/interval';
import { throttle } from 'rxjs/operators';
import { Config } from '../../config';
import { DeviceModel } from '../../models/device.model';
import { SettingsModel } from '../../models/settings.model';
import { DevicesProvider } from '../devices/devices';
import { ElectronProvider } from '../electron/electron';
import { UtilsProvider } from '../utils/utils';
declare global { interface Window { confetti: any; } }

/**
 * LicenseProvider comunicates with the subscription-server to see if there is
 * an active subscription for the current machine. (The check is done on app
 * start in the constructor)
 *
 * LicenseProvider provides methods to see wheter a certain feature can be
 * accessed with the active license like getNOMaxX or canUseX.
 *
 * Methods that looks like limitFeatureX must be called when the user tries to
 * use an X paid feature. These methods take care of disabling the feature for
 * the future use and inform the user about it through dialogs.
 *
 * LicenseProvider also provides other methods to show to the user
 * license-related dialogs and pages.
 *
 * // TODO: remove StorageProvider and use only ElectronStore ✅, this way should
 * be possible to convert all methods that looks like canUseX to limitFeatureX
 * so that this class can encapsulate all license related code
 *
 * Note: the "License" was previusly called "Subscription plan", that's why the
 * server replyes with the 'plan' value.
 */
@Injectable()
export class LicenseProvider {
  public static LICENSE_FREE = 'barcode-to-pc-free';
  public static LICENSE_BASIC = 'barcode-to-pc-basic-license';
  public static LICENSE_PRO = 'barcode-to-pc-pro-license';
  public static LICENSE_UNLIMITED = 'barcode-to-pc-unlimited-license';

  public activeLicense = LicenseProvider.LICENSE_FREE;
  public serial = '';

  private upgradeDialog: Alert = null;

  constructor(
    public http: HttpClient,
    private electronProvider: ElectronProvider,
    private alertCtrl: AlertController,
    private utilsProvider: UtilsProvider,
    private devicesProvider: DevicesProvider,
    public events: Events,
  ) {
    this.updateSubscriptionStatus();
    this.devicesProvider.onConnectedDevicesListChange().subscribe(devicesList => {
      let lastDevice = devicesList[devicesList.length - 1];
      this.limitNOMaxConnectedDevices(lastDevice, devicesList);
    })

    this.devicesProvider.onDeviceDisconnect().pipe(throttle(ev => interval(1000 * 60))).subscribe(async device => {
      if (this.activeLicense == LicenseProvider.LICENSE_FREE) {
        await this.showUpgradeDialog(
          'commercialUse',
          await this.utilsProvider.text('commercialUseDialogTitle'),
          await this.utilsProvider.text('commercialUseDialogMessage')
        )
      }
    })

    this.devicesProvider.onDeviceConnect().subscribe(device => {
      this.hideUpgradeDialog();
    })

    // if it's the first app start, initialize nextChargeDate and lastScanCountResetDate
    let nextChargeDate = this.electronProvider.store.get(Config.STORAGE_NEXT_CHARGE_DATE, null);
    if (nextChargeDate === null) { // happens only on the first start
      this.electronProvider.store.set(Config.STORAGE_NEXT_CHARGE_DATE, new Date().getTime() + 1000 * 60 * 60 * 24 * 31); // NOW() + 1 month
      this.electronProvider.store.set(Config.STORAGE_LAST_SCAN_COUNT_RESET_DATE, 0); // 0 = past moment
    }
  }

  /**
   * This method finds out if there is an active subscription for the current
   * machine and saves it locally by contacting the btp-license-server.
   *
   * Once it has been executed the other methods of this class will return the
   * corresponding max allowed values for the active license (eg.
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
    this.activeLicense = this.electronProvider.store.get(Config.STORAGE_SUBSCRIPTION, LicenseProvider.LICENSE_FREE)

    if (serial) {
      this.serial = serial;
      this.electronProvider.store.set(Config.STORAGE_SERIAL, this.serial);
    } else {
      this.serial = this.electronProvider.store.get(Config.STORAGE_SERIAL, '')
    }

    let now = new Date().getTime();
    let nextChargeDate = this.electronProvider.store.get(Config.STORAGE_NEXT_CHARGE_DATE);
    let canResetScanCount = now > nextChargeDate;

    // The scanCount is resetted based on the server first run date
    if (canResetScanCount) {
      this.electronProvider.store.set(Config.STORAGE_MONTHLY_SCAN_COUNT, 0);
      this.electronProvider.store.set(Config.STORAGE_NEXT_CHARGE_DATE, this.generateNextChargeDate());
    }

    // Do not bother the license-server if there isn't an active subscription
    if (serial == '' && this.serial == '' && this.activeLicense == LicenseProvider.LICENSE_FREE) {
      // it's also required to check this.serial == '' because when there isn't
      // a internet connection the license gets downgraded but the serial is
      // still saved to the storage
      return;
    }

    this.http.post(Config.URL_ORDER_CHECK, {
      serial: this.serial,
      uuid: this.electronProvider.uuid
    }).subscribe(async value => {
      this.electronProvider.store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
      if (value['active'] == true) {

        // If the license name changed it means that a license UPGRADE has been performed
        // The 'plan' attribute referes to the license name.
        if (this.activeLicense != value['plan']) {
          console.log('upgrade')
          this.electronProvider.store.set(Config.STORAGE_NEXT_CHARGE_DATE, this.generateNextChargeDate());
          this.electronProvider.store.set(Config.STORAGE_SUBSCRIPTION, value['plan']);
          this.activeLicense = value['plan'];
        }

        if (serial) {
          let everActivated = this.electronProvider.store.get(Config.STORAGE_LICENSE_EVER_ACTIVATED, false);
          if (!everActivated) {
            this.electronProvider.store.set(Config.STORAGE_MONTHLY_SCAN_COUNT, 0);
          }
          this.electronProvider.store.set(Config.STORAGE_LICENSE_EVER_ACTIVATED, true);
          this.utilsProvider.showSuccessNativeDialog(await this.utilsProvider.text('licenseActivatedDialogMessage'));
          window.confetti.start(3000);
          this.events.publish('license:activate');
        }
      } else {
        // When the license-server says that the subscription is not active
        // the user should be propted immediatly, no matter what is passed a
        // serial or not.
        this.deactivate();
        this.utilsProvider.showErrorNativeDialog(value['message']);
      }
    }, async (error: HttpErrorResponse) => {
      if (serial) {
        // if (error.status == 503) {
        //   this.utilsProvider.showErrorNativeDialog('Unable to fetch the subscription information, try later (FS problem)');
        // }
        this.deactivate();
        this.utilsProvider.showErrorNativeDialog(await this.utilsProvider.text('licenseActivationErrorDialogMessage'));
      } else {
        // Perhaps there is a connection problem, wait 15 days before asking the
        // user to enable the connection.
        // For simplicty the STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE field is used
        // only within this method
        let firstFailDate = this.electronProvider.store.get(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
        let now = new Date().getTime();
        if (firstFailDate && (now - firstFailDate) > 1296000000) { //  15 days = 1296000000 ms
          this.electronProvider.store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
          this.deactivate();
          this.utilsProvider.showErrorNativeDialog(await this.utilsProvider.text('licensePeriodicCheckErrorDialogMessage'));
        } else {
          this.electronProvider.store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, now);
        }
      }
    })
  } // updateSubscriptionStatus

  /**
   * Resets the license to FREE.
   *
   * @param clearSerial If TRUE the serial number is removed from the storage.
   * The serial should be cleared only if the user explicitely deactivates the
   * license from the UI.
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
    let downgradeToFree = async () => {
      this.activeLicense = LicenseProvider.LICENSE_FREE;
      this.electronProvider.store.set(Config.STORAGE_SUBSCRIPTION, this.activeLicense);

      let settings: SettingsModel = this.electronProvider.store.get(Config.STORAGE_SETTINGS, new SettingsModel(UtilsProvider.GetOS()));
      if (!(await this.canUseCSVAppend(false))) {
        settings.appendCSVEnabled = false;
      }
      if (!(await this.canUseNumberParameter(false))) {
        for (let i in settings.outputProfiles) {
          settings.outputProfiles[i].outputBlocks = settings.outputProfiles[i].outputBlocks.filter(x => x.value != 'number');
        }
      }
      this.electronProvider.store.set(Config.STORAGE_SETTINGS, settings);
      this.events.publish('license:deactivate');
    }

    if (clearSerial) {
      this.http.post(Config.URL_ORDER_DEACTIVATE, {
        serial: this.serial,
        uuid: this.electronProvider.uuid
      }).subscribe(value => {
        downgradeToFree();
        this.serial = '';
        this.electronProvider.store.set(Config.STORAGE_SERIAL, this.serial);
      }, async (error: HttpErrorResponse) => {
        this.utilsProvider.showErrorNativeDialog(await this.utilsProvider.text('licenseDeactivationErrorDialogMessage'));
      });
    } else {
      downgradeToFree();
    }
  }

  showPricingPage(refer) {
    // customOutputField
    let customOutputField = false;
    let settings = this.electronProvider.store.get(Config.STORAGE_SETTINGS, new SettingsModel(UtilsProvider.GetOS()));
    let defaultSettings = new SettingsModel(UtilsProvider.GetOS());

    if (settings.outputProfiles.length != 1) {
      customOutputField = true;
    } else {
      if (settings.outputProfiles[0].outputBlocks.length != 2) {
        customOutputField = true;
      } else {
        if (settings.outputProfiles[0].outputBlocks[0].value != defaultSettings.outputProfiles[0].outputBlocks[0].value ||
          settings.outputProfiles[0].outputBlocks[1].value != defaultSettings.outputProfiles[0].outputBlocks[1].value) {
          customOutputField = true;
        }
      }
    }

    // scanLimitReached
    let scanLimitReached =
      this.getNOMaxAllowedScansPerMonth() - this.electronProvider.store.get(Config.STORAGE_MONTHLY_SCAN_COUNT, 0) <= 0;

    // periodOfUseSinceFirstConnection
    let periodOfUseSinceFirstConnection = 'days';
    let days = parseInt(
      ((new Date().getTime() - this.electronProvider.store.get(Config.STORAGE_FIRST_CONNECTION_DATE, 0)) / 86400000) + ''
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
        currentPlan: this.activeLicense,
        customOutputField: customOutputField,
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
  async limitNOMaxConnectedDevices(device: DeviceModel, connectedDevices: DeviceModel[]) {
    if (connectedDevices.length > this.getNOMaxAllowedConnectedDevices()) {
      let message = await this.utilsProvider.text('deviceLimitsReachedDialogMessage');
      this.devicesProvider.kickDevice(device, message);
      await this.showUpgradeDialog(
        'limitNOMaxConnectedDevices',
        await this.utilsProvider.text('deviceLimitsReachedDialogTitle'), message
      );
    }
  }

  /**
   * This method should be called when retrieving a set of new scans.
   * It kicks out all devices and shows a dialog when the monthly limit of scans
   * has been exceeded
   */
  async limitMonthlyScans(noNewScans = 1) {
    if (this.activeLicense == LicenseProvider.LICENSE_UNLIMITED) {
      return;
    }

    let count = this.electronProvider.store.get(Config.STORAGE_MONTHLY_SCAN_COUNT, 0);
    count += noNewScans;
    this.electronProvider.store.set(Config.STORAGE_MONTHLY_SCAN_COUNT, count);

    if (count > this.getNOMaxAllowedScansPerMonth()) {
      let message = await this.utilsProvider.text('scansLimitReachedDialogMessage');
      this.devicesProvider.kickAllDevices(message);
      await this.showUpgradeDialog(
        'limitMonthlyScans',
        await this.utilsProvider.text('scansLimitReachedDialogTitle'),
        message
      );
    }
  }

  /**
   * Shuld be called when the user tries to drag'n drop the number component.
   * @returns FALSE if the feature should be limited
   */
  canUseNumberParameter(showUpgradeDialog = true): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      let available = false;
      switch (this.activeLicense) {
        case LicenseProvider.LICENSE_FREE: available = false; break;
        case LicenseProvider.LICENSE_BASIC: available = true; break;
        case LicenseProvider.LICENSE_PRO: available = true; break;
        case LicenseProvider.LICENSE_UNLIMITED: available = true; break;
      }

      if (!available && showUpgradeDialog) {
        await this.showUpgradeDialog(
          'canUseNumberParameter',
          await this.utilsProvider.text('numberComponentNotAvailableDialogTitle'),
          await this.utilsProvider.text('numberComponentNotAvailableDialogMessage'),
        );
      }
      resolve(available);
    });
  }

  /**
   * Shuld be called when the user tries to enable the CSV append option
   * @returns FALSE if the feature should be limited
   */
  canUseCSVAppend(showUpgradeDialog = false): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      let available = false;
      switch (this.activeLicense) {
        case LicenseProvider.LICENSE_FREE: available = false; break;
        case LicenseProvider.LICENSE_BASIC: available = true; break;
        case LicenseProvider.LICENSE_PRO: available = true; break;
        case LicenseProvider.LICENSE_UNLIMITED: available = true; break;
      }
      if (!available && showUpgradeDialog) {
        await this.showUpgradeDialog(
          'canUseCSVAppend',
          await this.utilsProvider.text('csvAppendNotAvailableDialogTitle'),
          await this.utilsProvider.text('csvAppendNotAvailableDialogMessage'),
        );
      }
      resolve(available);
    });
  }

  getNOMaxComponents() {
    switch (this.activeLicense) {
      case LicenseProvider.LICENSE_FREE: return 4;
      case LicenseProvider.LICENSE_BASIC: return 5;
      case LicenseProvider.LICENSE_PRO: return 10;
      case LicenseProvider.LICENSE_UNLIMITED: return Number.MAX_SAFE_INTEGER;
    }
  }

  getNOMaxAllowedConnectedDevices() {
    switch (this.activeLicense) {
      case LicenseProvider.LICENSE_FREE: return 1;
      case LicenseProvider.LICENSE_BASIC: return 1;
      case LicenseProvider.LICENSE_PRO: return 3;
      case LicenseProvider.LICENSE_UNLIMITED: return Number.MAX_SAFE_INTEGER;
    }
  }

  getNOMaxAllowedScansPerMonth() {
    switch (this.activeLicense) {
      case LicenseProvider.LICENSE_FREE: return 300;
      case LicenseProvider.LICENSE_BASIC: return 1000;
      case LicenseProvider.LICENSE_PRO: return 10000;
      case LicenseProvider.LICENSE_UNLIMITED: return Number.MAX_SAFE_INTEGER;
    }
  }

  isSubscribed() {
    return this.activeLicense != LicenseProvider.LICENSE_FREE;
  }

  getLicenseName() {
    switch (this.activeLicense) {
      case LicenseProvider.LICENSE_FREE: return 'Free';
      case LicenseProvider.LICENSE_BASIC: return 'Basic';
      case LicenseProvider.LICENSE_PRO: return 'Pro';
      case LicenseProvider.LICENSE_UNLIMITED: return 'Unlimited'
    }
  }

  private async showUpgradeDialog(refer, title, message) {
    if (this.upgradeDialog != null) {
      return;
    }
    this.upgradeDialog = this.alertCtrl.create({
      title: title, message: message, buttons: [{
        text: await this.utilsProvider.text('upgradeDialogDismissButton'), role: 'cancel'
      }, {
        text: await this.utilsProvider.text('upgradeDialogUpgradeButton'), handler: (opts: AlertOptions) => {
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

  private generateNextChargeDate(): number {
    return new Date().getTime() + 1000 * 60 * 60 * 24 * 31; // NOW() + 1 month
  }
}
