/**
 * NotificationContainerComponent
 *
 * Displays notifications as overlays on the app UI.
 * This component is automatically added to app.html and doesn't need to be used directly.
 *
 * To show notifications, inject NotificationService in your component:
 *
 * @example
 * import { NotificationService } from '../../providers/notification-service/notification-service';
 *
 * constructor(private notificationService: NotificationService) {}
 *
 * // Show a simple notification
 * this.notificationService.info('Hello world!');
 *
 * // Show update notification with "Don't show again"
 * this.notificationService.show({
 *   id: 'update-available',
 *   message: 'A new update is available!',
 *   type: 'info',
 *   showNeverAgain: true,
 *   actionText: 'Download',
 *   actionCallback: () => { }
 * });
 *
 * See README.md for complete documentation.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Notification, NotificationService } from '../../providers/notification-service/notification-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-container',
  templateUrl: 'notification-container.html'
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscriptions: Subscription[] = [];
  private timers: Map<string, any> = new Map();

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    // Subscribe to new notifications
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(notification => {
        this.addNotification(notification);
      })
    );

    // Subscribe to dismiss events
    this.subscriptions.push(
      this.notificationService.dismiss$.subscribe(notificationId => {
        this.removeNotification(notificationId);
      })
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());

    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  private addNotification(notification: Notification): void {
    // Add to the list
    this.notifications.push(notification);

    // Set up auto-dismiss if duration is specified
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);

      this.timers.set(notification.id, timer);
    }
  }

  private removeNotification(notificationId: string): void {
    // Clear timer if exists
    const timer = this.timers.get(notificationId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(notificationId);
    }

    // Remove from list
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  onDismiss(notification: Notification): void {
    this.notificationService.dismiss(notification.id, false);
  }

  onDismissPermanently(notification: Notification): void {
    this.notificationService.dismiss(notification.id, true);
  }

  onAction(notification: Notification): void {
    if (notification.actionCallback) {
      notification.actionCallback();
    }
    // Optionally dismiss after action
    this.notificationService.dismiss(notification.id, false);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  }
}
