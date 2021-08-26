import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import ElectronStore from 'electron-store';
import { Events, ViewController } from 'ionic-angular';
import { Config } from '../../../../electron/src/config';
import { ElectronProvider } from '../../providers/electron/electron';
import { LicenseProvider } from '../../providers/license/license';
import { UtilsProvider } from '../../providers/utils/utils';

@Component({
  selector: 'page-activate',
  templateUrl: 'activate.html',
})
export class ActivatePage {
  public uuid = '';
  public serial = '';
  public numberComponent = 'No';
  public appendToCSV = 'No';

  private store: ElectronStore;

  constructor(
    private electronProvider: ElectronProvider,
    public viewCtrl: ViewController,
    public licenseProvider: LicenseProvider,
    public events: Events,
    public utils: UtilsProvider,
    public translateService: TranslateService,
  ) {
    this.store = new this.electronProvider.ElectronStore();
    this.serial = this.licenseProvider.serial;
  }

  ionViewWillEnter() {
    this.refresh();
    this.events.subscribe('license:activate', () => { this.refresh(); });
    this.events.subscribe('license:deactivate', () => { this.refresh(); });
  }

  ionViewWillLeave() {
    this.events.unsubscribe('license:activate');
    this.events.unsubscribe('license:deactivate');
  }

  async refresh() {
    this.numberComponent =
      await this.licenseProvider.canUseNumberParameter(false) ?
        await this.utils.text('featureAvailableYes') :
        await this.utils.text('featureAvailableNo');
    this.appendToCSV = await this.licenseProvider.canUseCSVAppend() ?
      await this.utils.text('featureAvailableYes') :
      await this.utils.text('featureAvailableNo');
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
      return this.translateService.instant('featureUnlimited');
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
      return this.translateService.instant('featureUnlimited');
    }
    return number + '';
  }

  isUnlimited() {
    return this.licenseProvider.activeLicense == LicenseProvider.LICENSE_UNLIMITED;
  }
}
