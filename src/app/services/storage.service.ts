import { Injectable } from '@angular/core';
import { ScanSessionModel } from '../models/scan-session.model'
import { ScanModel } from '../models/scan.model'
import { SettingsModel } from '../models/settings.model'

@Injectable()
export class Storage {
  private static SCAN_SESSIONS = "scan_sessions";
  private static SETTINGS = "settings";
  private static EVER_CONNECTED = "ever_connected";
  private static LAST_SCAN_DATE = "last_scan_date";

  constructor(
  ) { }

  getScanSessions(): ScanSessionModel[] {
    return JSON.parse(localStorage.getItem(Storage.SCAN_SESSIONS)) || [];
  }

  setScanSessions(scanSessions: ScanSessionModel[]) {
    localStorage.setItem(Storage.SCAN_SESSIONS, JSON.stringify(scanSessions));
  }


  getSettings(): SettingsModel {
    return JSON.parse(localStorage.getItem(Storage.SETTINGS)) || new SettingsModel();
  }

  setSettings(settings: SettingsModel) {
    localStorage.setItem(Storage.SETTINGS, JSON.stringify(settings));
  }

  getEverConnected(): boolean {
    return JSON.parse(localStorage.getItem(Storage.EVER_CONNECTED)) || false;
  }

  setEverConnected(everConnected: boolean) {
    localStorage.setItem(Storage.EVER_CONNECTED, JSON.stringify(everConnected));
  }

  getLastScanDate(deviceId: string): number {
    let lsd = localStorage.getItem(Storage.LAST_SCAN_DATE + '_' + deviceId);
    console.log(lsd)
    if (!lsd) {
      return 0;
    }
    return JSON.parse(lsd);
  }

  setLastScanDate(deviceId: string, lastScanDate: number) {
    if (deviceId && lastScanDate) {
      localStorage.setItem(Storage.LAST_SCAN_DATE + '_' + deviceId, JSON.stringify(lastScanDate));
    }
  }

}
