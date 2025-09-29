import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, PopoverController } from 'ionic-angular';
import { Config } from '../../config';
import { ElectronProvider } from '../../providers/electron/electron';
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
    public popoverCtrl: PopoverController
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  ionViewCanLeave(): boolean {
    // Allow leaving if user is authenticated OR has explicitly skipped
    const email = localStorage.getItem('email');
    const authSkipped = localStorage.getItem('authSkipped');

    if (email) {
      console.log('[login] Allowing leave - user authenticated');
      return true;
    }

    if (authSkipped === 'true') {
      console.log('[login] Allowing leave - user skipped authentication');
      return true;
    }

    console.log('[login] Cannot leave - user not authenticated and did not skip');
    return false;
  }

  onSignUpClick() {
    // Open the authentication URL
    this.electronProvider.shell.openExternal('https://auth.barcodetopc.com/login');

    // Show the fallback input after opening the signup page
    this.showFallbackInput = true;
  }

  onUseFallbackClick() {
    if (!this.fallbackData || !this.fallbackData.trim()) {
      return;
    }

    this.isProcessing = true;

    try {
      // Decode base64 data
      const decodedData = atob(this.fallbackData.trim());
      const userData = JSON.parse(decodedData);

      // Store user data for telemetry
      if (userData.email) {
        localStorage.setItem('email', userData.email);
      }
      if (userData.name) {
        localStorage.setItem('name', userData.name);
      }

      // Show success feedback
      if (userData.email && userData.name) {
        console.log('[login] User authenticated via fallback:', { email: userData.email, name: userData.name });

        // Close the login page
        this.close();


        setTimeout(() => {

          // Show success message
          if (window.confetti_v2) {
            window.confetti_v2(`Welcome ${userData.name}!`);
          }
        }, 1400);

      } else {
        console.error('[login] Invalid user data in fallback');
        this.isProcessing = false;
      }
    } catch (error) {
      console.error('[login] Error decoding fallback data:', error);
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
      console.log('[login] Help popover dismissed with data:', data);
      if (data && data.action === 'skip') {
        console.log('[login] User chose to skip authentication');
        // Set a flag to indicate skipped authentication
        localStorage.setItem('authSkipped', 'true');
        console.log('[login] Dismissing login modal with skipped flag');
        this.viewCtrl.dismiss({ skipped: true });
      }
    });

    popover.present({
      ev: event
    });
  }

  getAppName() {
    return Config.APP_NAME;
  }
}
