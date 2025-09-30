import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  public showOfflineButton: boolean = false;
  private connectivityTimeoutId: any;
  private hasBeenSkipped: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
    public popoverCtrl: PopoverController,
    public utils: UtilsProvider,
    public telemetryService: TelemetryService,
    private http: HttpClient,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    this.checkConnectivityAndSetTimeout();
  }

  ionViewWillLeave() {
    // Clear any pending connectivity timeout
    if (this.connectivityTimeoutId) {
      clearTimeout(this.connectivityTimeoutId);
      this.connectivityTimeoutId = null;
    }
  }

  private checkConnectivityAndSetTimeout() {
    // First check if browser reports being online
    if (!navigator.onLine) {
      console.log('[login] Browser reports offline, showing offline button');
      this.showOfflineButton = true;
      return;
    }

    // Set a 5-second timeout to show offline button if no response
    this.connectivityTimeoutId = setTimeout(() => {
      console.log('[login] Connectivity check timeout, showing offline button');
      this.showOfflineButton = true;
      this.telemetryService.sendEvent('login_offline_button_shown_timeout', null, null);
    }, 5000);

    // Check internet connectivity using the same domain as license.ts to avoid CORS
    // Try to make a simple HEAD request to the license server
    this.http.head(Config.URL_LICENSE_SERVER_CHECK).subscribe(
      (response) => {
        // Clear timeout if we get a successful response
        if (this.connectivityTimeoutId) {
          clearTimeout(this.connectivityTimeoutId);
          this.connectivityTimeoutId = null;
        }
        console.log('[login] Internet connectivity confirmed');
        // Hide offline button if it was shown
        this.showOfflineButton = false;
      },
      (error: HttpErrorResponse) => {
        // Clear timeout and show offline button on error
        if (this.connectivityTimeoutId) {
          clearTimeout(this.connectivityTimeoutId);
          this.connectivityTimeoutId = null;
        }
        console.log('[login] No internet connectivity detected, showing offline button');
        this.showOfflineButton = true;
      }
    );
  }

  ionViewCanLeave(): boolean {
    // Allow leaving if user is authenticated OR has been skipped in current session
    const email = localStorage.getItem('email');
    if (this.hasBeenSkipped || email) {
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
        this.hasBeenSkipped = true;
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

  onOfflineClick() {
    console.log('[login] User chose to continue in offline mode');
    this.telemetryService.sendEvent('login_offline_click', null, null);

    // Set temporary skip flag for current session
    this.hasBeenSkipped = true;

    // Dismiss the login page with skipped and offline flags
    this.viewCtrl.dismiss({
      skipped: true,
      offlineMode: true
    });
  }
}
