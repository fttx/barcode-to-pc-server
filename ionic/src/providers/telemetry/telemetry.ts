import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Config } from '../../config';

@Injectable()
export class TelemetryService {
  private eventQueue: any[] = [];
  private timer: any;

  constructor(private http: HttpClient) {
    this.startTimer();
    this.loadQueueFromStorage();
  }

  private startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.sendEvents();
      }
    }, 60000); // 1 minute
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

  private sendEvents() {
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    if (!email) return;
    this.http.post(Config.URL_TELEMETRY, { events: this.eventQueue, email, name })
      .subscribe(() => {
        this.eventQueue = [];
        this.saveQueueToStorage();
        console.log('[telemetry] Events sent successfully as ', email);
      });
  }

  sendEvent(eventType: string, eventValueInt: number, eventValueText: string): void {
    const event = { eventType, eventValueInt, eventValueText };
    this.eventQueue.push(event);
    this.saveQueueToStorage();
    console.log('[telemetry] Event queued:', event);
  }
}
