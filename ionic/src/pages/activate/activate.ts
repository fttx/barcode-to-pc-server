import { Component } from '@angular/core';
import ElectronStore from 'electron-store';
import { ViewController } from 'ionic-angular';
import { Config } from '../../../../electron/src/config';
import { ElectronProvider } from '../../providers/electron/electron';
import { LicenseProvider } from '../../providers/license/license';

@Component({
  selector: 'page-activate',
  templateUrl: 'activate.html',
})
export class ActivatePage {
  public uuid = '';
  public serial = '';

  private store: ElectronStore;

  constructor(
    private electronProvider: ElectronProvider,
    public viewCtrl: ViewController,
    public licenseProvider: LicenseProvider,
  ) {
    this.store = new this.electronProvider.ElectronStore();
    this.serial = this.licenseProvider.serial;
  }

  close() {
    this.viewCtrl.dismiss();
  }

  onActivationClick() {
    this.licenseProvider.updateSubscriptionStatus(this.serial);
  }

  onDeactivateClick() {
    // TODO: send the user an e-mail with a token and only when the e-mail is
    // verified deactivate the license
    // Alternatively do it manually with human support


    // DEBUG ONLY:
    this.serial = '';
    this.licenseProvider.deactivate(true);
  }

  getRemainingScans() {
    if (this.licenseProvider.getNOMaxAllowedScansPerMonth() == Number.MAX_SAFE_INTEGER) {
      return 'Unlimited'
    }
    return this.licenseProvider.getNOMaxAllowedScansPerMonth() - this.store.get(Config.STORAGE_MONTHLY_SCAN_COUNT, 0)
  }

  getNextChargeDate() {
    return new Date(this.store.get(Config.STORAGE_NEXT_CHARGE_DATE, 0)).toLocaleDateString();
  }

  contactSupportClick() {
    this.electronProvider.shell.openExternal('mailto:' + Config.EMAIL_SUPPORT);
  }

  getSupportEmail() {
    return Config.EMAIL_SUPPORT;
  }

  ordersSupportClick() {
    this.electronProvider.shell.openExternal(Config.URL_ORDERS_SUPPORT);
  }

  onClearSerialClick() {
    this.serial = '';
    this.licenseProvider.deactivate(true);
  }

  toReadable(number: number) {
    if (number == Number.MAX_SAFE_INTEGER) {
      return 'Unlimited'
    }
    return number + '';
  }
}
