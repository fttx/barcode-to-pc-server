import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { ScanSessionModel } from '../../models/scan-session.model';
import { SettingsModel } from '../../models/settings.model';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
  private static SCAN_SESSIONS = "scan_sessions";
  private static SETTINGS = "settings";
  private static EVER_CONNECTED = "ever_connected";
  private static LAST_SCAN_DATE = "last_scan_date";

  constructor(
    public storage: Storage
  ) {
    console.log('Hello StorageProvider Provider');
  }

  getScanSessions(): ScanSessionModel[] {
    return JSON.parse(localStorage.getItem(StorageProvider.SCAN_SESSIONS)) || [];
  }

  setScanSessions(scanSessions: ScanSessionModel[]) {
    localStorage.setItem(StorageProvider.SCAN_SESSIONS, JSON.stringify(scanSessions));
  }


  getSettings(): SettingsModel {
    return JSON.parse(localStorage.getItem(StorageProvider.SETTINGS)) || new SettingsModel();
  }

  setSettings(settings: SettingsModel) {
    localStorage.setItem(StorageProvider.SETTINGS, JSON.stringify(settings));
  }

  getEverConnected(): boolean {
    return JSON.parse(localStorage.getItem(StorageProvider.EVER_CONNECTED)) || false;
  }

  setEverConnected(everConnected: boolean) {
    localStorage.setItem(StorageProvider.EVER_CONNECTED, JSON.stringify(everConnected));
  }

  getLastScanDate(deviceId: string): number {
    let lsd = localStorage.getItem(StorageProvider.LAST_SCAN_DATE + '_' + deviceId);
    console.log(lsd)
    if (!lsd) {
      return 0;
    }
    return JSON.parse(lsd);
  }

  setLastScanDate(deviceId: string, lastScanDate: number) {
    if (deviceId && lastScanDate) {
      localStorage.setItem(StorageProvider.LAST_SCAN_DATE + '_' + deviceId, JSON.stringify(lastScanDate));
    }
  }
}
