import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModalController } from 'ionic-angular';
import { Config } from '../../config';
import { ElectronProvider } from '../electron/electron';
import { LoginPage } from '../../pages/login/login';

interface TelemetryEvent {
  eventType: string;
  eventValueInt: number;
  eventValueText: string;
  created_at: number; // Unix timestamp in milliseconds
}

@Injectable()
export class TelemetryService {
  private eventQueue: TelemetryEvent[] = [];
  private timer: any;
  private loginModal: any = null;
  private authCheckInterval: any = null;

  constructor(
    private http: HttpClient,
    private electronProvider: ElectronProvider,
    private modalCtrl: ModalController
  ) {
    this.startTimer();
    this.loadQueueFromStorage();

    if (!localStorage.getItem('email')) {
      console.log('[telemetry] User not authenticated, showing login page');
      this.showLoginPage();
    }
  }

  private startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.sendEvents();
      }
    }, this.electronProvider.isDev() ? 10000 : 60000); // 1 minute
  }

  private loadQueueFromStorage() {
    const savedQueue = localStorage.getItem('telemetryQueue');
    if (savedQueue) {
      this.eventQueue = JSON.parse(savedQueue);
    }
  }

  private saveQueueToStorage() {
    localStorage.setItem('telemetryQueue', JSON.stringify(this.eventQueue));
  }

  private isUserAuthenticated(): boolean {
    const email = localStorage.getItem('email');
    return !!email;
  }

  private startAuthCheck() {
    // Check every 2 seconds if user became authenticated (from deep link or fallback)
    this.authCheckInterval = setInterval(() => {
      if (this.isUserAuthenticated() && this.loginModal) {
        console.log('[telemetry] User authenticated externally, closing login modal');
        this.closeLoginModal();
      }
    }, 2000);
  }

  private stopAuthCheck() {
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
      this.authCheckInterval = null;
    }
  }

  private closeLoginModal() {
    if (this.loginModal) {
      console.log('[telemetry] Closing login modal due to successful authentication');
      this.loginModal.dismiss();
      this.loginModal = null;
      this.stopAuthCheck();
    }
  }


  private showLoginPage(): Promise<boolean> {
    // Prevent opening multiple login modals
    if (this.loginModal) {
      console.log('[telemetry] Login modal already open, skipping');
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      this.loginModal = this.modalCtrl.create(LoginPage, {}, {
        enableBackdropDismiss: false,
        showBackdrop: true
      });

      // Start checking for authentication changes
      this.startAuthCheck();

      this.loginModal.onDidDismiss((data) => {
        // Clear the modal reference
        this.loginModal = null;

        // Stop checking for authentication changes
        this.stopAuthCheck();

        // Check if user skipped authentication
        if (data && data.skipped) {
          console.log('[telemetry] User skipped authentication');
          resolve(true); // Allow to continue but with limited features
          return;
        }

        // Check if user is now authenticated after the modal closed
        const isAuthenticated = this.isUserAuthenticated();
        console.log('[telemetry] Login modal dismissed, authenticated:', isAuthenticated);
        resolve(isAuthenticated);
      });

      this.loginModal.present();
    });
  } private async sendEvents() {
    if (!this.isUserAuthenticated()) {
      console.log('[telemetry] User not authenticated, showing login page');
      const authenticated = await this.showLoginPage();
      if (!authenticated) {
        console.log('[telemetry] User cancelled authentication, events will remain queued');
        return;
      }
    }

    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    if (!email) return;

    this.http.post(Config.URL_TELEMETRY, {
      events: this.eventQueue,
      email,
      name,
      uuid: this.electronProvider.uuid
    }).subscribe({
      next: () => {
        this.eventQueue = [];
        this.saveQueueToStorage();
        console.log('[telemetry] Events sent successfully as ', email);
      },
      error: (err) => { }
    });
  }

  sendEvent(eventType: string, eventValueInt: number, eventValueText: string): void {
    const event: TelemetryEvent = {
      eventType,
      eventValueInt,
      eventValueText,
      created_at: Date.now()
    };
    this.eventQueue.push(event);
    this.saveQueueToStorage();
    console.log('[telemetry] Event queued:', event);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isUserAuthenticated();
  }

  /**
   * Force authentication page to appear
   */
  async forceAuthentication(): Promise<boolean> {
    return await this.showLoginPage();
  }

  /**
   * Close the login modal if it's open (called when authentication succeeds externally)
   */
  closeLoginModalIfOpen(): void {
    this.closeLoginModal();
  }
}
