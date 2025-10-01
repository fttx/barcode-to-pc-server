import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Alert, AlertController, AlertOptions, Events } from 'ionic-angular';
import { interval } from 'rxjs/observable/interval';
import { throttle } from 'rxjs/operators';
import { Config } from '../../config';
import { DeviceModel } from '../../models/device.model';
import { SettingsModel } from '../../models/settings.model';
import { DevicesProvider } from '../devices/devices';
import { ElectronProvider } from '../electron/electron';
import { UtilsProvider } from '../utils/utils';
import { BtpAlertController } from '../btp-alert-controller/btp-alert-controller';
import { TelemetryService } from '../telemetry/telemetry';
import { AudioProvider } from '../audio/audio';
import { ContentType } from '@angular/http/src/enums';

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

  public static LICENSE_PRO_MONTHLY = 'barcode-to-pc-pro-monthly-subscription';
  public static LICENSE_PRO_YEARLY = 'barcode-to-pc-pro-yearly-subscription';
  public static LICENSE_STARTER_MONTHLY = 'barcode-to-pc-starter-monthly-subscription';
  public static LICENSE_STARTER_YEARLY = 'barcode-to-pc-starter-yearly-subscription';

  public activeLicense = LicenseProvider.LICENSE_FREE;
  public serial = '';

  private upgradeDialog: Alert = null;
  private v4UpgradeDialog: Alert = null;

  constructor(
    public http: HttpClient,
    private electronProvider: ElectronProvider,
    private alertCtrl: BtpAlertController,
    private utilsProvider: UtilsProvider,
    private devicesProvider: DevicesProvider,
    public events: Events,
    private telemetryProvider: TelemetryService,
    private audioProvider: AudioProvider,
  ) {
    this.init();


    // Check for bonus codes beign scanned
    this.events.subscribe('new:scan', async (barcodeText) => {
      console.log('Barcode scanned', barcodeText);
      if (!barcodeText && !barcodeText.length) return;

      const isBonusCode = (barcodeText) => {
        try {
          const result = JSON.parse(barcodeText);
          if (result && result.btp === true) { return result }
          return false;
        } catch { return false; }
      }
      const bonusObj = isBonusCode(barcodeText);
      if (bonusObj !== false) {
        // Try to fetch the bonus data from the back-end server
        const response: any = await this.http.post(Config.URL_LICENSE_SERVER + '/bonus/verify', { code: bonusObj.code, }).toPromise();
        console.log('Bonus code payload', response);
        if (response && response.data) {
          localStorage.setItem('email', response.email);
          localStorage.setItem('name', response.name);

          let bonusStr = localStorage.getItem('bonuses');
          let bonusArray = []
          if (bonusStr) { bonusArray = JSON.parse(bonusStr); }

          // Prevent welcome discounts to be added multiple times
          if (response.data && response.data.is_welcome && bonusArray.findIndex(x => x.is_welcome) !== -1) {
            this.utilsProvider.showErrorNativeDialog('Welcome bonus already redeemed');
            return;
          }

          // Save bonuses to the localStorage array
          bonusArray.push(response.data);
          localStorage.setItem('bonuses', JSON.stringify(bonusArray));

          if (response.data.scans) {
            window.confetti_v2(`+${response.data.scans} Scans Unlocked!`);
          }
        }
      }
    });
  }

  async init(): Promise<void> {
    await this.updateSubscriptionStatus();

    setInterval(() => {
      this.updateSubscriptionStatus();
    }, 1000 * 60 * 60 * 24 * 15); // 15 days (We cannot use 31 since we excede 32 bit-intergers)

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

    setInterval(() => {
      // Clear the last nonces every 5 minutes, but always keep the last 10
      if (this.lastNonces.length > 10) {
        this.lastNonces = this.lastNonces.slice(this.lastNonces.length - 10);
      }
    }, 1000 * 60 * 5);
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
   *
   * @param serial The license serial number to activate
   * @param showSuccessDialog Whether to show the success dialog (default: true)
   */
  updateSubscriptionStatus(serial: string = '', showSuccessDialog: boolean = true): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.activeLicense = this.electronProvider.store.get(Config.STORAGE_SUBSCRIPTION, LicenseProvider.LICENSE_FREE);

      if (serial) {
        this.serial = serial;
        this.electronProvider.store.set(Config.STORAGE_SERIAL, this.serial);
      } else {
        this.serial = this.electronProvider.store.get(Config.STORAGE_SERIAL, '');
      }

      let now = new Date().getTime();
      let nextChargeDate = this.electronProvider.store.get(Config.STORAGE_NEXT_CHARGE_DATE);
      let canResetScanCount = now > nextChargeDate;

      if (canResetScanCount) {
        this.electronProvider.store.set(Config.STORAGE_MONTHLY_SCAN_COUNT, 0);
        // For the life-time license type we generate then next charge date automatically
        switch (this.activeLicense) {
          case LicenseProvider.LICENSE_FREE:
          case LicenseProvider.LICENSE_BASIC:
          case LicenseProvider.LICENSE_PRO:
          case LicenseProvider.LICENSE_UNLIMITED: {
            this.electronProvider.store.set(Config.STORAGE_NEXT_CHARGE_DATE, this.generateNextChargeDate());
          }
        }
      }

      if (serial === '' && this.serial === '' && this.activeLicense === LicenseProvider.LICENSE_FREE) {
        resolve();
        return;
      }

      this.http.post(Config.URL_ORDER_CHECK, {
        serial: this.serial,
        uuid: this.electronProvider.uuid
      }).subscribe(async value => {
        this.electronProvider.store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
        if (value['active'] === true) {

          // We always override what we have in the storage
          localStorage.setItem('license', JSON.stringify(value));
          switch (value['plan']) {
            case LicenseProvider.LICENSE_PRO_MONTHLY:
            case LicenseProvider.LICENSE_PRO_YEARLY:
            case LicenseProvider.LICENSE_STARTER_MONTHLY:
            case LicenseProvider.LICENSE_STARTER_YEARLY: {
              // For the subscription model we use the server data as source of truth for the next charge date
              // This way the user sees coherent data between the app and the account management page
              // The only caevat is that the user must have an internet connection at least once a month or
              // the app won't never reset the scan count
              const nextChargeDate = new Date(value['next_charge_date']).getTime();
              this.electronProvider.store.set(Config.STORAGE_NEXT_CHARGE_DATE, nextChargeDate);
            }
          }

          // This happens only if  we manually change the license from the db
          if (this.activeLicense !== value['plan']) {
            if (value['version'] === 'v3') {
              await this.showV4UpgradeDialog();
              resolve();
              return;
            }
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
            this.devicesProvider.unkickAllDevices();


            const incentiveEmail = localStorage.getItem('email');
            this.telemetryProvider.sendEvent('license_activate', null, JSON.stringify({
              license: this.activeLicense,
              incentiveEmail: incentiveEmail,
              orderEmail: value['email'],
            }));
            this.events.publish('license:activate');
            if (!incentiveEmail) {
              // override the email
              localStorage.setItem('email', value['email']);
            }

            if (showSuccessDialog) {
              this.utilsProvider.showSuccessNativeDialog(await this.utilsProvider.text('licenseActivatedDialogMessage'));
              this.audioProvider.playSound('confetti_v2_free.ogg');
              window.confetti.start(3000);
            }
          }

          if (value['version'] === 'v3') {
            await this.showV4UpgradeDialog();
          }
        } else {
          this.deactivate();
          this.utilsProvider.showErrorNativeDialog(value['message']);
        }
        resolve();
      }, async (error: HttpErrorResponse) => {
        if (serial) {
          this.deactivate();
          this.utilsProvider.showErrorNativeDialog(await this.utilsProvider.text('licenseActivationErrorDialogMessage'));
        } else {
          let firstFailDate = this.electronProvider.store.get(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
          let now = new Date().getTime();
          if (firstFailDate && (now - firstFailDate) > 1296000000) { // 15 days
            this.electronProvider.store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, 0);
            this.deactivate();
            this.utilsProvider.showErrorNativeDialog(await this.utilsProvider.text('licensePeriodicCheckErrorDialogMessage'));
          } else {
            this.electronProvider.store.set(Config.STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE, now);
          }
        }
        resolve();
      });
    });
  }


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
      // Get license from localstorage parse and disable active field
      const license = JSON.parse(localStorage.getItem('license') || '{}');
      license['active'] = false;
      localStorage.setItem('license', JSON.stringify(license));
      this.electronProvider.store.set(Config.STORAGE_SETTINGS, settings);
      this.telemetryProvider.sendEvent('license_deactivate', null, this.activeLicense);
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

    // scans clustering
    let currentScanCount = this.electronProvider.store.get(Config.STORAGE_MONTHLY_SCAN_COUNT, 0);
    let scansCluster = [5, 10, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000, 10000, 100000, 100000000]
      .find(cluster => currentScanCount <= cluster) || 100000000;

    // Put everything together and open the url in the system browser
    const params = {
      currentPlan: this.activeLicense,
      customOutputField: customOutputField,
      scanLimitReached: scanLimitReached,
      periodOfUseSinceFirstConnection: periodOfUseSinceFirstConnection,
      scans: scansCluster,
      refer: refer,
    };
    this.electronProvider.shell.openExternal(
      this.utilsProvider.appendParametersToURL(Config.URL_PRICING, params)
    );
    this.telemetryProvider.sendEvent('upgrade_click', null, JSON.stringify(params));
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
   * has been exceeded.
   *
   * @returns the current scan count
   */
  private lastNonces: string[] = [];
  async limitMonthlyScans(noNewScans = 1, scanNonce: string) {
    let count = this.electronProvider.store.get(Config.STORAGE_MONTHLY_SCAN_COUNT, 0);

    // Prevent double counting of the same scan
    if (scanNonce !== null && noNewScans > 0 && this.lastNonces.indexOf(scanNonce) != -1) {
      return count;
    }
    this.lastNonces.push(scanNonce);

    count += noNewScans;
    this.electronProvider.store.set(Config.STORAGE_MONTHLY_SCAN_COUNT, count);
    this.telemetryProvider.sendEvent('scan', noNewScans, null);

    if (this.activeLicense == LicenseProvider.LICENSE_UNLIMITED) {
      return count;
    }

    if (count > this.getNOMaxAllowedScansPerMonth()) {
      let message = await this.utilsProvider.text('scansLimitReachedDialogMessage');
      this.devicesProvider.kickAllDevices(message);
      await this.showUpgradeDialog(
        'limitMonthlyScans',
        await this.utilsProvider.text('scansLimitReachedDialogTitle'),
        message
      );
    }
    return count;
  }

  getNOMaxTemplates(): number {
    switch (this.activeLicense) {
      case LicenseProvider.LICENSE_FREE: { return 1; }

      case LicenseProvider.LICENSE_BASIC:
      case LicenseProvider.LICENSE_PRO:
      case LicenseProvider.LICENSE_UNLIMITED: { return Number.MAX_SAFE_INTEGER; }

      case LicenseProvider.LICENSE_PRO_MONTHLY:
      case LicenseProvider.LICENSE_PRO_YEARLY:
      case LicenseProvider.LICENSE_STARTER_MONTHLY:
      case LicenseProvider.LICENSE_STARTER_YEARLY:
      default: { return LicenseProvider.GetPlanData().templates; }
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

        case LicenseProvider.LICENSE_PRO_MONTHLY:
        case LicenseProvider.LICENSE_PRO_YEARLY:
        case LicenseProvider.LICENSE_STARTER_MONTHLY:
        case LicenseProvider.LICENSE_STARTER_YEARLY:
        default: { available = true; }
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

        case LicenseProvider.LICENSE_PRO_MONTHLY:
        case LicenseProvider.LICENSE_PRO_YEARLY:
        case LicenseProvider.LICENSE_STARTER_MONTHLY:
        case LicenseProvider.LICENSE_STARTER_YEARLY:
        default: { available = true; }
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

  getNOMaxComponents(): number {
    switch (this.activeLicense) {
      case LicenseProvider.LICENSE_FREE: return 4;
      case LicenseProvider.LICENSE_BASIC: return 5;
      case LicenseProvider.LICENSE_PRO: return 10;
      case LicenseProvider.LICENSE_UNLIMITED: return Number.MAX_SAFE_INTEGER;

      default: { return LicenseProvider.GetPlanData().components; }
    }
  }

  getNOMaxAllowedConnectedDevices(): number {
    switch (this.activeLicense) {
      case LicenseProvider.LICENSE_FREE: return 1;
      case LicenseProvider.LICENSE_BASIC: return 1;
      case LicenseProvider.LICENSE_PRO: return 3;
      case LicenseProvider.LICENSE_UNLIMITED: return Number.MAX_SAFE_INTEGER;

      default: { return LicenseProvider.GetPlanData().devices; }
    }
  }

  getNOMaxAllowedScansPerMonth() {
    switch (this.activeLicense) {
      case LicenseProvider.LICENSE_FREE: return 300 + this.getScanOffset();
      case LicenseProvider.LICENSE_BASIC: return 1000 + this.getScanOffset();
      case LicenseProvider.LICENSE_PRO: return 10000 + this.getScanOffset();
      case LicenseProvider.LICENSE_UNLIMITED: return Number.MAX_SAFE_INTEGER;
      default: { return LicenseProvider.GetPlanData().scans + this.getScanOffset(); }
    }
  }

  getScanOffset() {
    let offset = 0;
    const bonusScans = localStorage.getItem('bonuses');
    if (bonusScans) {
      const bonusScansArray = JSON.parse(bonusScans);
      for (let i = 0; i < bonusScansArray.length; i++) {
        const bonusScan = bonusScansArray[i];
        if (bonusScan && bonusScan.scans && bonusScan.valid_until && new Date(bonusScan.valid_until).getTime() > new Date().getTime()) {
          offset += bonusScan.scans;
        }
      }
    }
    return offset;
  }

  isSubscribed() {
    // get license and check if active = 1
    const license = LicenseProvider.GetLicense();
    return license && license['active'];
  }

  getLicenseName() {
    switch (this.activeLicense) {
      case LicenseProvider.LICENSE_FREE: return 'Free';
      case LicenseProvider.LICENSE_BASIC: return 'Basic';
      case LicenseProvider.LICENSE_PRO: return 'Pro';
      case LicenseProvider.LICENSE_UNLIMITED: return 'Unlimited';

      case LicenseProvider.LICENSE_PRO_MONTHLY: return 'Pro';
      case LicenseProvider.LICENSE_PRO_YEARLY: return 'Pro';
      case LicenseProvider.LICENSE_STARTER_MONTHLY: return 'Starter';
      case LicenseProvider.LICENSE_STARTER_YEARLY: return 'Starter';
    }
  }

  private async showUpgradeDialog(refer, title, message) {
    await this.hideUpgradeDialog();
    this.upgradeDialog = this.alertCtrl.create({
      title: title, message: message, buttons: [{
        text: await this.utilsProvider.text('upgradeDialogDismissButton'), role: 'cancel'
      }, {
        text: await this.utilsProvider.text('upgradeDialogUpgradeButton'), handler: (opts: AlertOptions) => {
          this.showPricingPage(refer + 'Dialog');
        }
      }]
    });
    this.telemetryProvider.sendEvent('show_upgrade_dialog', null, refer);
    await this.upgradeDialog.present();
  }

  private async hideUpgradeDialog() {
    if (this.upgradeDialog != null) {
      try { await this.upgradeDialog.dismiss(); } catch (error) { }
    }
    return 0;
  }

  private async showV4UpgradeDialog() {
    if (this.v4UpgradeDialog != null) {
      return;
    }
    this.v4UpgradeDialog = this.alertCtrl.create({
      title: 'License upgrade', message: `The server has been updated to v${this.electronProvider.appGetVersion()}.<br><br>
              Your license can be used for v3.x.x versions of the server only.<br><br><br>
              You can:<br><br>
              1) Install the previous version of the server and use your current license<br><br>
              or<br><br>
              2) Upgrade your existing license at a reduced price`,
      buttons: [{
        text: 'Ignore', role: 'cancel'
      }, {
        text: 'Keep old version', handler: (opts: AlertOptions) => {
          this.electronProvider.shell.openExternal(Config.URL_V3);
        }
      }, {
        text: 'Upgrade license', handler: (opts: AlertOptions) => {
          const upgradeUrl = new URL(Config.URL_V4);
          upgradeUrl.searchParams.set('serial', this.serial);
          this.electronProvider.shell.openExternal(upgradeUrl.href);
        }
      }],
      cssClass: 'changelog'
    });
    this.v4UpgradeDialog.onDidDismiss(() => this.v4UpgradeDialog = null)
    this.v4UpgradeDialog.present();
  }

  private generateNextChargeDate(): number {
    return new Date().getTime() + 1000 * 60 * 60 * 24 * 31; // NOW() + 1 month
  }

  public static GetPlanData() {
    const license = LicenseProvider.GetLicense();
    if (!license) { return null; }
    return LicenseProvider.GetLicense()['plan_data'];
  }

  public static GetLicense() {
    return JSON.parse(localStorage.getItem('license'));
  }
}
