import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { LicenseProvider } from '../../providers/license/license';
import { ElectronProvider } from '../../providers/electron/electron';
import { Config } from '../../../../electron/src/config';

@Component({
  selector: 'page-activate',
  templateUrl: 'activate.html',
})
export class ActivatePage {
  public uuid = '';
  public serial = '';

  constructor(
    private electronProvider: ElectronProvider,
    public viewCtrl: ViewController,
    public licenseProvider: LicenseProvider,
  ) {
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
    let store = new this.electronProvider.ElectronStore();
    return this.licenseProvider.getNOMaxAllowedScansPerMonth() -  store.get(Config.STORAGE_MONTHLY_SCANS_COUNT, 0)
  }
}
