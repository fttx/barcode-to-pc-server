import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { ScanSessionModel } from '../../models/scan-session.model';
import { SettingsModel } from '../../models/settings.model';

/**
 * Deprecated, use ElectronStore instead
 */
@Injectable()
export class StorageProvider {
  private static SCAN_SESSIONS = "scan_sessions";
  private static SETTINGS = "settings";

  constructor(
    public storage: Storage
  ) { }

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
}
