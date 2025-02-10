import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, ViewController } from 'ionic-angular';
import { Config } from '../../config';
import { ElectronProvider } from '../../providers/electron/electron';
import { LicenseProvider } from '../../providers/license/license';
import { UtilsProvider } from '../../providers/utils/utils';

@Component({
  selector: 'page-activate',
  templateUrl: 'activate.html',
})
export class ActivatePage {
  private static cachedScans: string | null = null;
  public uuid = '';
  public serial = '';
  public numberComponent = 'No';
  public appendToCSV = 'No';
  public isRefreshing = false;
  public aiTokens = '';

  constructor(
    private electronProvider: ElectronProvider,
    public viewCtrl: ViewController,
    public licenseProvider: LicenseProvider,
    public events: Events,
    public utils: UtilsProvider,
    public translateService: TranslateService,
  ) {
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

    let consumed = 0, tokens = 0;
    const license = LicenseProvider.GetLicense();
    if (license && license.ai_tokens_consumed) { consumed = license.ai_tokens_consumed; }
    const plan = LicenseProvider.GetPlanData();
    if (plan && plan.ai_tokens) { tokens = plan.ai_tokens; }
    this.aiTokens = consumed + "/" + tokens;

    // Update scans cache
    this.updateScansCache();
  }

  private updateScansCache() {
    if (this.licenseProvider.getNOMaxAllowedScansPerMonth() == Number.MAX_SAFE_INTEGER) {
      ActivatePage.cachedScans = this.translateService.instant('featureUnlimited');
    } else {
      ActivatePage.cachedScans = this.electronProvider.store.get(Config.STORAGE_MONTHLY_SCAN_COUNT, 0) + '/' +
        this.licenseProvider.getNOMaxAllowedScansPerMonth();
    }
  }

  async refreshLicenseInfo() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    try {
      await this.licenseProvider.init();
      await this.refresh();
    } finally {
      this.isRefreshing = false;
    }
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

  getScans() {
    if (!ActivatePage.cachedScans) {
      this.updateScansCache();
    }
    return ActivatePage.cachedScans;
  }

  getNextChargeDate() {
    return new Date(this.electronProvider.store.get(Config.STORAGE_NEXT_CHARGE_DATE, 0)).toLocaleDateString();
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

  getAITokens() {
    return this.aiTokens;
  }

  getLicense() {
    return JSON.parse(localStorage.getItem('license'));
  }
}
