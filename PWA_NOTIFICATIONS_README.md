# meowCHAT Push Notification System

## Overview

meowCHAT now includes a comprehensive push notification system that allows users to receive real-time notifications for:

- **New Messages**: When someone sends you a direct message
- **Post Likes**: When someone likes your posts
- **Post Comments**: When someone comments on your posts
- **Friend Requests**: When someone sends you a friend request
- **General Updates**: For app updates and general announcements

## Features

### 🔔 Real-time Push Notifications

- Notifications work even when the app is closed or phone is locked
- Rich notifications with action buttons (Reply, View, Accept, etc.)
- Vibration and sound alerts
- Notification history and read status tracking

### ⚙️ Granular Notification Settings

- Users can enable/disable specific notification types
- Settings are saved locally and synced to server
- Easy-to-use notification settings UI

### 📱 PWA Integration

- Works seamlessly with the Progressive Web App
- Background sync for offline notifications
- Automatic subscription management

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your deployment:

```bash
# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

### 2. Generate VAPID Keys

You can generate VAPID keys using the `pywebpush` library:

```python
from pywebpush import WebPushException, webpush
from py_vapid import Vapid

# Generate new VAPID keys
vapid = Vapid()
vapid_claims = {
    "sub": "mailto:your-email@example.com",
}

# Get the keys
private_key = vapid.private_key
public_key = vapid.public_key

print(f"VAPID_PUBLIC_KEY={public_key}")
print(f"VAPID_PRIVATE_KEY={private_key}")
```

### 3. Install Dependencies

Make sure you have the required packages:

```bash
pip install pywebpush
```

### 4. Database Migration

The notification system adds new tables. Run the database migration:

```python
# In your Flask app context
from app import db
db.create_all()
```

## How It Works

### Frontend (JavaScript)

1. **Permission Request**: Users are prompted to enable notifications
2. **Subscription**: The app subscribes to push notifications using the VAPID public key
3. **Settings Management**: Users can customize which notifications they want to receive
4. **Service Worker**: Handles incoming push notifications and displays them

### Backend (Python)

1. **Event Detection**: When events occur (like, comment, message, etc.), the system checks if notifications are enabled
2. **Notification Sending**: Uses the `send_push_notification()` function to send notifications
3. **Subscription Management**: Stores and manages user push subscriptions
4. **Settings Storage**: Saves user notification preferences

### Service Worker

1. **Push Event Handling**: Receives push notifications from the server
2. **Notification Display**: Shows rich notifications with action buttons
3. **Click Handling**: Opens the appropriate page when notifications are clicked
4. **Background Sync**: Syncs notifications when the app comes back online

## API Endpoints

### Notification Management

- `GET /api/notifications/vapid-public-key` - Get VAPID public key
- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `POST /api/notifications/unsubscribe` - Unsubscribe from push notifications
- `POST /api/notifications/verify` - Verify subscription validity
- `POST /api/notifications/test` - Send test notification
- `GET /api/notifications/settings` - Get user notification settings
- `POST /api/notifications/settings` - Update notification settings
- `GET /api/notifications/pending` - Get pending notifications
- `POST /api/notifications/mark-read` - Mark notifications as read

## User Experience

### First Time Setup

1. User visits the app
2. Notification prompt appears (if not previously dismissed)
3. User clicks "Enable Notifications"
4. Browser asks for permission
5. If granted, user is subscribed to push notifications
6. Notification settings UI becomes available

### Daily Usage

1. Users receive notifications for relevant events
2. Clicking notifications opens the appropriate page
3. Users can manage settings via the notification button in the top nav
4. Settings are automatically synced across devices

### Notification Types

- **Messages**: "New message from [User]" with Reply and View Chat actions
- **Likes**: "[User] liked your post" with View Post action
- **Comments**: "[User] commented on your post" with View Post action
- **Friend Requests**: "Friend request from [User]" with Accept and View Profile actions

## Troubleshooting

### Common Issues

1. **Notifications not working**: Check VAPID keys and browser permissions
2. **Service worker not registering**: Ensure HTTPS is enabled (required for service workers)
3. **Subscriptions failing**: Verify VAPID keys are correctly set
4. **Notifications not showing**: Check browser notification settings

### Debug Commands

```javascript
// Check notification permission
console.log(Notification.permission);

// Check service worker registration
navigator.serviceWorker.getRegistrations().then((registrations) => {
  console.log("Service Workers:", registrations);
});

// Test notification manually
window.pwaUtils.notificationManager.testNotification();
```

## Security Considerations

- VAPID keys should be kept secure and not exposed in client-side code
- User consent is required before sending notifications
- Subscriptions are tied to user accounts
- Invalid subscriptions are automatically cleaned up

## Performance

- Notifications are sent asynchronously to avoid blocking user actions
- Failed notifications are logged for debugging
- Background sync ensures notifications aren't lost when offline
- Notification history is limited to prevent database bloat

## Future Enhancements

- Notification grouping for multiple events
- Custom notification sounds
- Notification scheduling
- Rich media in notifications
- Cross-platform notification sync
