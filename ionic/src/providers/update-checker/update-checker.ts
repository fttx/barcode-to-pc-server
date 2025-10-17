import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Config } from '../../config';
import { NotificationService } from '../notification-service/notification-service';
import { ElectronProvider } from '../electron/electron';

/**
 * UpdateCheckerService
 *
 * Handles checking for new versions of the app and displaying update notifications.
 * The notification system allows users to dismiss individual version notifications,
 * but will show them again on next launch if an update is still available.
 */
@Injectable()
export class UpdateCheckerService {
  private readonly repoOwner = 'fttx';
  private readonly repoName = 'barcode-to-pc-server';
  private readonly storageKeyPrefix = 'update_dismissed_';
  private readonly lastCheckKey = 'lastUpdateCheck';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private electronProvider: ElectronProvider
  ) { }

  /**
   * Check for updates and show notification if a new version is available
   * @param currentVersion - The current version of the app
   * @param showNotification - Whether to show a notification (default: true)
   */
  checkForUpdates(currentVersion: string, showNotification: boolean = true): Promise<{ hasUpdate: boolean, latestVersion?: string }> {
    return new Promise((resolve) => {
      const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`;

      // Update last check timestamp
      localStorage.setItem(this.lastCheckKey, new Date().toLocaleString());

      this.http.get(url).subscribe(
        (data: any) => {
          const latestVersion = data.tag_name;

          // Normalize versions by removing 'v' prefix for comparison
          const normalizedCurrent = currentVersion.replace(/^v/i, '');
          const normalizedLatest = latestVersion.replace(/^v/i, '');

          if (this.isNewerVersion(normalizedLatest, normalizedCurrent)) {
            // New update available
            if (showNotification) {
              this.showUpdateNotification(latestVersion);
            }
            resolve({ hasUpdate: true, latestVersion });
          } else {
            // Already up to date
            resolve({ hasUpdate: false });
          }
        },
        (error) => {
          console.error('Error checking for updates:', error);
          // Don't show notification on network error to avoid bothering user when offline
          resolve({ hasUpdate: false });
        }
      );
    });
  }

  /**
   * Show update notification using the notification service
   * The notification is dismissible but will reappear on next app launch if update is still available
   */
  private showUpdateNotification(newVersion: string): void {
    const notificationId = this.getNotificationIdForVersion(newVersion);

    // Check if this specific version notification was dismissed for this session
    if (this.isVersionDismissedThisSession(newVersion)) {
      return;
    }

    this.notificationService.show({
      id: notificationId,
      message: this.translateService.instant('updateAvailableNotification', { version: newVersion }),
      type: 'info',
      dismissable: true,
      showNeverAgain: false, // Don't offer "never show again" - updates are important
      duration: 0, // Don't auto-dismiss
      actionText: this.translateService.instant('download'),
      actionCallback: () => {
        this.electronProvider.shell.openExternal(Config.URL_DOWNLOAD_SERVER);
        // Mark as dismissed for this session when user clicks download
        this.markVersionDismissedThisSession(newVersion);
      }
    });

    // Listen for manual dismissal (subscribe only once per version check)
    const dismissSubscription = this.notificationService.dismiss$.subscribe((dismissedId) => {
      if (dismissedId === notificationId) {
        this.markVersionDismissedThisSession(newVersion);
        dismissSubscription.unsubscribe(); // Clean up subscription
      }
    });
  }

  /**
   * Compare two semantic versions to determine if newVersion is newer than currentVersion
   * Supports versions with or without 'v' prefix (e.g., "4.8.8" or "v4.8.8")
   * @param newVersion - The new version to compare
   * @param currentVersion - The current version to compare against
   * @returns true if newVersion is newer than currentVersion
   */
  private isNewerVersion(newVersion: string, currentVersion: string): boolean {
    // Remove 'v' prefix if present and split into parts
    const newParts = newVersion.replace(/^v/i, '').split('.').map(Number);
    const currentParts = currentVersion.replace(/^v/i, '').split('.').map(Number);

    // Compare each part (major, minor, patch)
    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (newPart > currentPart) {
        return true;
      } else if (newPart < currentPart) {
        return false;
      }
    }

    // Versions are equal
    return false;
  }

  /**
   * Get unique notification ID for a specific version
   */
  private getNotificationIdForVersion(version: string): string {
    return `update_available_${version}`;
  }

  /**
   * Mark a version as dismissed for the current session only
   * This prevents the notification from reappearing during the same app session
   */
  private markVersionDismissedThisSession(version: string): void {
    sessionStorage.setItem(this.storageKeyPrefix + version, 'true');
  }

  /**
   * Check if a version notification was dismissed in the current session
   */
  private isVersionDismissedThisSession(version: string): boolean {
    return sessionStorage.getItem(this.storageKeyPrefix + version) === 'true';
  }

  /**
   * Get the last time an update check was performed
   */
  getLastUpdateCheck(): string {
    return localStorage.getItem(this.lastCheckKey) || 'Never';
  }
}
