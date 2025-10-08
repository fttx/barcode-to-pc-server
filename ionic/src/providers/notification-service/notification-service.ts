/**
 * NotificationService
 *
 * Service for displaying notification overlays throughout the app.
 *
 * @example
 * // Inject in your component
 * import { NotificationService } from '../../providers/notification-service/notification-service';
 * constructor(private notificationService: NotificationService) {}
 *
 * // Simple notifications
 * this.notificationService.info('Hello!');
 * this.notificationService.success('Saved!', { duration: 3000 });
 * this.notificationService.warning('Warning message');
 * this.notificationService.error('Error occurred');
 *
 * // Advanced notification with all options
 * this.notificationService.show({
 *   id: 'update-available',
 *   message: 'A new update is available!',
 *   type: 'info',
 *   showNeverAgain: true,
 *   dismissable: true,
 *   actionText: 'Download',
 *   actionCallback: () => { }
 * });
 *
 * See README.md in components/notification-container for complete documentation.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationConfig {
  id?: string; // Unique identifier for tracking dismissals
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  dismissable?: boolean;
  showNeverAgain?: boolean; // Show "Don't show again" option
  duration?: number; // Auto-dismiss after milliseconds (0 = no auto-dismiss)
  actionText?: string; // Optional action button text
  actionCallback?: () => void; // Optional action callback
}

export interface Notification extends NotificationConfig {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  dismissable: boolean;
  showNeverAgain: boolean;
  duration: number;
  timestamp: number;
}

@Injectable()
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  private dismissSubject = new Subject<string>();
  private storageKey = 'btp_dismissed_notifications';

  public notifications$ = this.notificationSubject.asObservable();
  public dismiss$ = this.dismissSubject.asObservable();

  constructor() { }

  /**
   * Show a notification
   */
  show(config: NotificationConfig): void {
    // Check if this notification was permanently dismissed
    if (config.id && this.isPermanentlyDismissed(config.id)) {
      return;
    }

    const notification: Notification = {
      id: config.id || this.generateId(),
      message: config.message,
      type: config.type || 'info',
      dismissable: config.dismissable !== false, // Default to true
      showNeverAgain: config.showNeverAgain || false,
      duration: config.duration !== undefined ? config.duration : 0,
      actionText: config.actionText,
      actionCallback: config.actionCallback,
      timestamp: Date.now()
    };

    this.notificationSubject.next(notification);
  }

  /**
   * Dismiss a notification
   */
  dismiss(notificationId: string, permanent: boolean = false): void {
    if (permanent) {
      this.addToDismissedList(notificationId);
    }
    this.dismissSubject.next(notificationId);
  }

  /**
   * Check if a notification was permanently dismissed
   */
  isPermanentlyDismissed(notificationId: string): boolean {
    try {
      const dismissed = localStorage.getItem(this.storageKey);
      if (!dismissed) return false;

      const dismissedList: string[] = JSON.parse(dismissed);
      return dismissedList.indexOf(notificationId) !== -1;
    } catch (error) {
      console.error('Error checking dismissed notifications:', error);
      return false;
    }
  }

  /**
   * Add notification to permanently dismissed list
   */
  private addToDismissedList(notificationId: string): void {
    try {
      const dismissed = localStorage.getItem(this.storageKey);
      let dismissedList: string[] = dismissed ? JSON.parse(dismissed) : [];

      if (dismissedList.indexOf(notificationId) === -1) {
        dismissedList.push(notificationId);
        localStorage.setItem(this.storageKey, JSON.stringify(dismissedList));
      }
    } catch (error) {
      console.error('Error saving dismissed notification:', error);
    }
  }

  /**
   * Clear all permanently dismissed notifications (useful for testing/debugging)
   */
  clearDismissedList(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing dismissed notifications:', error);
    }
  }

  /**
   * Generate a unique notification ID
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convenience methods for common notification types

  info(message: string, config?: Partial<NotificationConfig>): void {
    this.show({ ...config, message, type: 'info' });
  }

  success(message: string, config?: Partial<NotificationConfig>): void {
    this.show({ ...config, message, type: 'success' });
  }

  warning(message: string, config?: Partial<NotificationConfig>): void {
    this.show({ ...config, message, type: 'warning' });
  }

  error(message: string, config?: Partial<NotificationConfig>): void {
    this.show({ ...config, message, type: 'error' });
  }
}
