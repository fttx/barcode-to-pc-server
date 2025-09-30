import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Config } from '../../config';
import { ElectronProvider } from '../electron/electron';

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

  constructor(
    private http: HttpClient,
    private electronProvider: ElectronProvider
  ) {
    this.startTimer();
    this.loadQueueFromStorage();
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

  private async sendEvents() {
    if (!this.isUserAuthenticated()) {
      console.log('[telemetry] User not authenticated, events will remain queued');
      return;
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
}
