import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Config } from '../../config';
import { ElectronProvider } from '../electron/electron';

interface TelemetryEvent {
  eventType: string;
  eventValueInt: number;
  eventValueText: string;
  serverVersion?: string;
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
    // Start timer
    this.timer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.sendEvents();
      }
    }, this.electronProvider.isDev() ? 10000 : 60000); // 1 minute

    // Load queue from storage
    try {
      const savedQueue = localStorage.getItem('telemetryQueue');
      if (savedQueue) {
        this.eventQueue = JSON.parse(savedQueue);
      }
    } catch (err) {
      console.error('[telemetry] Failed to load queue from storage:', err);
      this.eventQueue = [];
    }
  }

  private saveQueueToStorage() {
    try {
      localStorage.setItem('telemetryQueue', JSON.stringify(this.eventQueue));
    } catch (err) {
      console.error('[telemetry] Failed to save queue to storage:', err);
    }
  }

  private async sendEvents() {
    const email = localStorage.getItem('email');
    if (!email) {
      console.log('[telemetry] User not authenticated, events will remain queued');
      return;
    }

    const name = localStorage.getItem('name');

    // Aggregate scan events by summing their eventValueInt
    const scanEvents = this.eventQueue.filter(e => e.eventType === 'scan');
    const nonScanEvents = this.eventQueue.filter(e => e.eventType !== 'scan');

    let eventsToSend = this.eventQueue;
    if (scanEvents.length > 0) {
      const totalScanValue = scanEvents.reduce((sum, event) => sum + event.eventValueInt, 0);
      const aggregatedScanEvent: TelemetryEvent = {
        eventType: 'scan',
        eventValueInt: totalScanValue,
        eventValueText: null,
        serverVersion: scanEvents[scanEvents.length - 1].serverVersion,
        created_at: scanEvents[scanEvents.length - 1].created_at
      };
      eventsToSend = [...nonScanEvents, aggregatedScanEvent];
    }

    this.http.post(Config.URL_TELEMETRY, {
      events: eventsToSend,
      email,
      name,
      uuid: this.electronProvider.uuid
    }).subscribe({
      next: () => {
        this.eventQueue = [];
        this.saveQueueToStorage();
        console.log('[telemetry] Events sent successfully as ', email);
      },
      error: (err) => {
        console.error('[telemetry] Failed to send events, will retry later:', err);
      }
    });
  }

  sendEvent(eventType: string, eventValueInt: number, eventValueText: string): void {
    // Determine server version the same way as info.ts getVersion()
    let serverVersion: string;
    if (this.electronProvider.isDev()) {
      serverVersion = '(DEV MODE)';
    } else if (ElectronProvider.isElectron()) {
      serverVersion = this.electronProvider.appGetVersion();
    } else {
      serverVersion = '(BROWSER MODE)';
    }

    const event: TelemetryEvent = {
      eventType,
      eventValueInt,
      eventValueText,
      serverVersion: serverVersion,
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
    return !!localStorage.getItem('email');
  }
}
