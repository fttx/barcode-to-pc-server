import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-login-help-popover',
  template: `
    <ion-list>
      <ion-list-header>
        {{ 'helpText' | translate }}
      </ion-list-header>
      <button ion-item (click)="onSkipClick()">
        {{ 'skipButton' | translate }}
      </button>
    </ion-list>
  `
})
export class LoginHelpPopover {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
  }

  onSkipClick() {
    this.viewCtrl.dismiss({ action: 'skip' });
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
