import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { LicenseProvider } from '../../providers/license/license';

@Component({
  selector: 'page-activate',
  templateUrl: 'activate.html',
})
export class ActivatePage {
  public uuid = '';
  public serial = '';

  constructor(
    public viewCtrl: ViewController,
    public licenseProvider: LicenseProvider
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
    this.licenseProvider.deactivateSubscription();
  }
}
