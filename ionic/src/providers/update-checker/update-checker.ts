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

                    if (latestVersion !== currentVersion) {
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

        // Listen for manual dismissal
        this.notificationService.dismiss$.subscribe((dismissedId) => {
            if (dismissedId === notificationId) {
                this.markVersionDismissedThisSession(newVersion);
            }
        });
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
