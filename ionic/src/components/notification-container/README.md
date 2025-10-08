# Notification System - Complete Guide

A clean, reusable notification component system for displaying overlay messages in the app.

**Compatible with:** Ionic v3 + Angular 5

---

## 🎯 Features

- ✅ **Parametric & Reusable** - Easily show different types of notifications
- ✅ **Dismissable** - Users can close notifications manually
- ✅ **Never Show Again** - Permanent dismissal option with localStorage persistence
- ✅ **Auto-dismiss** - Optional automatic dismissal after a duration
- ✅ **Action Buttons** - Add custom action buttons to notifications
- ✅ **Multiple Types** - Info, Success, Warning, Error with distinct styling
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Smooth Animations** - CSS-based slide-in animations

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Basic Usage](#basic-usage)
3. [Advanced Usage](#advanced-usage)
4. [API Reference](#api-reference)
5. [Code Examples](#code-examples)
6. [Testing](#testing)
7. [Customization](#customization)

---

## 🚀 Quick Start

### 1. Import the service in your component

```typescript
import { NotificationService } from '../../providers/notification-service/notification-service';

constructor(private notificationService: NotificationService) {}
```

### 2. Show a notification

```typescript
// Simple notification
this.notificationService.info("Hello world!");

// With "Don't show again" option
this.notificationService.show({
  id: "update-available",
  message: "A new update is available!",
  type: "info",
  showNeverAgain: true,
  actionText: "Download",
  actionCallback: () => {
    // Handle download
  },
});
```

---

## 📖 Basic Usage

### Simple Notifications

```typescript
// Info notification (blue)
this.notificationService.info("This is an information message");

// Success notification (green)
this.notificationService.success("Operation completed successfully!");

// Warning notification (yellow)
this.notificationService.warning("Please review your settings");

// Error notification (red)
this.notificationService.error("Something went wrong");
```

---

## 🔧 Advanced Usage

### 1. Notification with "Don't Show Again" Option

Perfect for update notifications, tips, or onboarding messages:

```typescript
this.notificationService.show({
  id: "update-available-v3.0", // Unique ID for tracking dismissals
  message: "A new update is available!",
  type: "info",
  showNeverAgain: true,
  dismissable: true,
});
```

### 2. Auto-Dismissing Notification

```typescript
this.notificationService.show({
  message: "File saved successfully",
  type: "success",
  duration: 3000, // Auto-dismiss after 3 seconds
  dismissable: false,
});
```

### 3. Notification with Action Button

```typescript
this.notificationService.show({
  message: "A new version is available",
  type: "info",
  actionText: "Update Now",
  actionCallback: () => {
    console.log("Update clicked");
    this.startUpdate();
  },
  dismissable: true,
});
```

### 4. Success with Auto-dismiss

```typescript
this.notificationService.success("Settings saved!", { duration: 3000 });
```

### 5. Error with Retry Action

```typescript
this.notificationService.error("Connection failed", {
  actionText: "Retry",
  actionCallback: () => this.retryConnection(),
});
```

---

## 📋 API Reference

### NotificationService Methods

#### `show(config: NotificationConfig): void`

Display a notification with full configuration options.

**Configuration Object:**

```typescript
{
  id?: string;              // Unique identifier for tracking dismissals
  message: string;          // The notification message text (required)
  type?: 'info' | 'success' | 'warning' | 'error';  // Default: 'info'
  dismissable?: boolean;    // Can be manually dismissed (default: true)
  showNeverAgain?: boolean; // Show "Don't show again" option (default: false)
  duration?: number;        // Auto-dismiss after ms, 0 = never (default: 0)
  actionText?: string;      // Text for action button
  actionCallback?: () => void; // Callback when action is clicked
}
```

#### `info(message: string, config?: Partial<NotificationConfig>): void`

Show an info notification (blue).

#### `success(message: string, config?: Partial<NotificationConfig>): void`

Show a success notification (green).

#### `warning(message: string, config?: Partial<NotificationConfig>): void`

Show a warning notification (yellow).

#### `error(message: string, config?: Partial<NotificationConfig>): void`

Show an error notification (red).

#### `dismiss(notificationId: string, permanent?: boolean): void`

Manually dismiss a notification.

#### `clearDismissedList(): void`

Clear all permanently dismissed notifications (useful for testing).

---

## 💡 Code Examples

### Example 1: Update Available Notification

```typescript
checkForUpdates() {
  this.electronProvider.on('update-available', (info) => {
    this.notificationService.show({
      id: 'update-available',
      message: 'A new update is available!',
      type: 'info',
      showNeverAgain: true,
      actionText: 'Learn More',
      actionCallback: () => {
        this.showUpdateDetails(info);
      }
    });
  });
}
```

### Example 2: First-Time User Tip

```typescript
showFirstTimeTip() {
  this.notificationService.show({
    id: 'first-time-tip-scans',
    message: '💡 Tip: You can drag and drop to reorder scan templates',
    type: 'info',
    showNeverAgain: true,
    duration: 8000 // Auto-dismiss after 8 seconds
  });
}
```

### Example 3: Connection Error with Retry

```typescript
onConnectionError(error: string) {
  this.notificationService.error(`Connection failed: ${error}`, {
    dismissable: true,
    actionText: 'Retry',
    actionCallback: () => this.retryConnection()
  });
}
```

### Example 4: Success Feedback

```typescript
onSaveSuccess() {
  this.notificationService.success('Settings saved successfully!', {
    duration: 3000
  });
}
```

### Example 5: Connection Success

```typescript
showConnectionSuccess(deviceName: string) {
  this.notificationService.success(`Connected to ${deviceName}`, {
    duration: 3000,
    dismissable: true
  });
}
```

### Example 6: Multiple Simple Notifications

```typescript
showSimpleNotifications() {
  this.notificationService.info('Processing your request...');
  this.notificationService.success('Settings saved!');
  this.notificationService.warning('Low disk space detected');
  this.notificationService.error('Failed to save file');
}
```

---

## 🧪 Testing

### Test Method

Add this method to any page (like HomePage) to test all notification types:

```typescript
import { NotificationService } from '../../providers/notification-service/notification-service';

constructor(
  private notificationService: NotificationService
) {}

testNotifications() {
  // Test 1: Info notification
  setTimeout(() => {
    this.notificationService.info('This is an info notification');
  }, 500);

  // Test 2: Success with auto-dismiss
  setTimeout(() => {
    this.notificationService.success('Operation successful!', {
      duration: 3000
    });
  }, 1500);

  // Test 3: Warning
  setTimeout(() => {
    this.notificationService.warning('This is a warning message');
  }, 2500);

  // Test 4: Error with action
  setTimeout(() => {
    this.notificationService.error('An error occurred', {
      actionText: 'Retry',
      actionCallback: () => {
        console.log('Retry clicked');
        this.notificationService.success('Retrying...');
      }
    });
  }, 3500);

  // Test 5: Update notification with "Don't show again"
  setTimeout(() => {
    this.notificationService.show({
      id: 'test-update',
      message: 'A new update is available! Click Download to install.',
      type: 'info',
      showNeverAgain: true,
      actionText: 'Download',
      actionCallback: () => {
        console.log('Download clicked');
        this.notificationService.success('Starting download...');
      }
    });
  }, 4500);
}
```

### Add Test Button to HTML

```html
<button ion-button (click)="testNotifications()">Test Notifications</button>
```

### Expected Behavior

1. **Info** (blue): Shows immediately, can be dismissed
2. **Success** (green): Auto-dismisses after 3 seconds
3. **Warning** (yellow): Shows and stays until dismissed
4. **Error** (red): Shows with Retry button
5. **Update** (blue): Shows with Download button and "Don't show again" option

### Testing "Don't Show Again"

1. Click "Don't show this again" on the update notification
2. Refresh the page and run `testNotifications()` again
3. The update notification should NOT appear (it's permanently dismissed)
4. To reset: `this.notificationService.clearDismissedList()`

### Verify localStorage

Open DevTools → Application → Local Storage → Your domain

- **Key**: `btp_dismissed_notifications`
- **Value**: `["test-update"]` (after dismissing)

---

## 🎨 Customization

### Styling

All styles are in `notification-container.scss`. Customize:

- Colors for each notification type
- Border styles
- Animation duration
- Positioning (default: bottom-right)
- Responsive breakpoints

### Notification Types & Colors

| Type        | Color            | Icon | Use Case                             |
| ----------- | ---------------- | ---- | ------------------------------------ |
| **info**    | Blue (#3880ff)   | ℹ️   | Updates, tips, general information   |
| **success** | Green (#2dd36f)  | ✓    | Confirmations, successful operations |
| **warning** | Yellow (#ffc409) | ⚠️   | Warnings, important notices          |
| **error**   | Red (#eb445a)    | ⊗    | Errors, failures, critical issues    |

### Positioning

- **Desktop**: Fixed bottom-right, max 420px width
- **Tablet**: Bottom-right with responsive margins
- **Mobile**: Full width at bottom with 10px margins
- **Z-index**: 99999 (appears above all content)

---

## 💾 Persistence

### How It Works

When a user clicks "Don't show this again":

- The notification `id` is saved to `localStorage`
- Key: `btp_dismissed_notifications`
- Value: Array of dismissed IDs
- Persists across app sessions and restarts
- Future notifications with the same `id` are automatically suppressed

### Reset Dismissed Notifications

```typescript
// For debugging/testing
this.notificationService.clearDismissedList();
console.log("All dismissed notifications have been reset");
```

---

## 📝 Notes

- Each notification should have a unique `id` if you want to track permanent dismissals
- Notifications stack vertically in the bottom-right corner
- Multiple notifications can be shown simultaneously
- On mobile devices, notifications span the full width at the bottom
- Notifications use CSS animations (no Angular animations dependency)
- Compatible with Ionic v3 and Angular 5

---

## 🎯 Perfect Use Cases

- ✓ "Update available" notifications
- ✓ Connection status messages
- ✓ Success/error feedback
- ✓ First-time user tips and onboarding
- ✓ Warning messages
- ✓ Any overlay notification needs

---

**That's it!** You're ready to use the notification system throughout your app. 🎉
