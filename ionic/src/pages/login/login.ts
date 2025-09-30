import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, PopoverController } from 'ionic-angular';
import { Config } from '../../config';
import { ElectronProvider } from '../../providers/electron/electron';
import { UtilsProvider } from '../../providers/utils/utils';
import { TelemetryService } from '../../providers/telemetry/telemetry';
import { LoginHelpPopover } from './login-help-popover';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  public showFallbackInput: boolean = false;
  public fallbackData: string = '';
  public isProcessing: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
    public popoverCtrl: PopoverController,
    public utils: UtilsProvider,
    public telemetryService: TelemetryService,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  ionViewCanLeave(): boolean {
    // Allow leaving if user is authenticated OR has explicitly skipped
    const email = localStorage.getItem('email');
    const authSkipped = localStorage.getItem('authSkipped');
    if (authSkipped === 'true' || email) {
      return true;
    }
    return false;
  }

  onSignUpClick() {
    // Open the authentication URL
    this.electronProvider.shell.openExternal('https://auth.barcodetopc.com/login');
    this.showFallbackInput = true;
    this.telemetryService.sendEvent('signup_click', null, null);
  }

  onUseFallbackClick() {
    if (!this.fallbackData || !this.fallbackData.trim()) {
      return;
    }

    this.isProcessing = true;

    const userData = this.utils.processUserAuthentication(this.fallbackData, 'fallback');

    if (userData) {
      console.log('[login] User authenticated via fallback:', userData);
      this.telemetryService.sendEvent('login', null, 'fallback');

      // Close the login page with success data
      this.viewCtrl.dismiss({
        authenticated: true
      });

      setTimeout(() => {
        this.utils.showAuthSuccessFeedback(userData);
      }, 1400);
    } else {
      console.error('[login] Invalid user data in fallback');
      this.isProcessing = false;
    }
  }

  close() {
    // Allow closing if user is authenticated OR has explicitly skipped
    const email = localStorage.getItem('email');
    const authSkipped = localStorage.getItem('authSkipped');

    console.log('[login] Closing login modal:', email ? 'authenticated' : 'skipped');
    this.viewCtrl.dismiss();
  }

  showHelp(event) {
    const popover = this.popoverCtrl.create(LoginHelpPopover);
    popover.onDidDismiss((data) => {
      if (data && data.action === 'skip') {
        console.log('[login] User chose to skip authentication');
        localStorage.setItem('authSkipped', 'true');
        this.telemetryService.sendEvent('login_skip', null, null);
        this.viewCtrl.dismiss({
          skipped: true
        });
      }
    });
    popover.present({ ev: event });
  }

  getAppName() {
    return Config.APP_NAME;
  }
}
