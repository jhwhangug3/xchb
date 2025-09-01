// PWA Utilities and Offline Functionality
class PWAUtils {
    constructor() {
        this.isOnline = navigator.onLine;
        this.currentVersion = 'v1.0.2';
        this.updateCheckInterval = null;
        this.notificationManager = null;
        this.init();
    }

    init() {
        this.setupOnlineOfflineHandlers();
        this.setupOfflineIndicator();
        this.setupNetworkStatus();
        this.setupBackgroundSync();
        this.setupAutoUpdates();
        this.setupServiceWorkerMessages();
        this.setupInstallPrompt();
        this.setupNotificationManager();
    }

    setupNotificationManager() {
        this.notificationManager = new NotificationManager();
    }

    setupAutoUpdates() {
        // Check for updates every 5 minutes when online
        this.updateCheckInterval = setInterval(() => {
            if (navigator.onLine) {
                this.checkForUpdates();
            }
        }, 5 * 60 * 1000); // 5 minutes

        // Check for updates when coming back online
        window.addEventListener('online', () => {
            this.checkForUpdates();
        });

        // Check for updates on page focus
        window.addEventListener('focus', () => {
            this.checkForUpdates();
        });
    }

    async checkForUpdates() {
        try {
            const response = await fetch('/api/pwa/version', {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const serverVersion = data.version;

                if (serverVersion !== this.currentVersion) {
                    console.log('New version available:', serverVersion);
                    this.showUpdateNotification(serverVersion);
                    this.currentVersion = serverVersion;
                }
            }
        } catch (error) {
            console.error('Update check failed:', error);
        }
    }

    showUpdateNotification(version) {
        // Create update notification
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <i class="fas fa-download"></i>
            <div>
                <strong>Update Available</strong>
                <p>Version ${version} is ready to install</p>
            </div>
            <button onclick="window.pwaUtils.installUpdate()" class="btn">Update Now</button>
            <button onclick="window.pwaUtils.dismissUpdate()" class="btn">Later</button>
        `;
        document.body.appendChild(notification);

        // Auto-dismiss after 30 seconds
        setTimeout(() => {
            this.dismissUpdate();
        }, 30000);
    }

    async installUpdate() {
        try {
            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }

            // Reset splash screen state for new version
            this.resetSplashScreen();

            // Reload the page to get fresh content
            window.location.reload();
        } catch (error) {
            console.error('Update installation failed:', error);
            // Fallback: just reload
            window.location.reload();
        }
    }

    dismissUpdate() {
        const notification = document.querySelector('.update-notification');
        if (notification) {
            notification.remove();
        }
    }

    setupServiceWorkerMessages() {
        // Listen for messages from service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                    this.showUpdateNotification(event.data.version);
                }
            });
        }
    }

    setupOnlineOfflineHandlers() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    setupOfflineIndicator() {
        // Don't create offline indicator automatically
        // Let the existing offline indicator handle it
    }

    showOfflineIndicator() {
        // Don't show offline indicator automatically
        // The existing system handles this
    }

    hideOfflineIndicator() {
        // Don't hide offline indicator automatically
        // The existing system handles this
    }

    setupNetworkStatus() {
        // Check network status periodically
        setInterval(() => {
            if (navigator.onLine !== this.isOnline) {
                this.isOnline = navigator.onLine;
                if (this.isOnline) {
                    this.syncOfflineData();
                }
            }
        }, 1000);
    }

    async syncOfflineData() {
        // Sync any offline data when connection is restored
        try {
            const offlineData = this.getOfflineData();
            if (offlineData.length > 0) {
                console.log('Syncing offline data:', offlineData.length, 'items');
                
                for (const data of offlineData) {
                    try {
                        await this.syncItem(data);
                    } catch (error) {
                        console.error('Failed to sync item:', error);
                    }
                }
                
                this.clearOfflineData();
                this.showSyncNotification();
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    async syncItem(data) {
        const response = await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: data.body
        });
        
        if (!response.ok) {
            throw new Error(`Sync failed: ${response.status}`);
        }
        
        return response;
    }

    getOfflineData() {
        const data = localStorage.getItem('offlineData');
        return data ? JSON.parse(data) : [];
    }

    saveOfflineData(data) {
        const existing = this.getOfflineData();
        existing.push({
            ...data,
            timestamp: Date.now()
        });
        localStorage.setItem('offlineData', JSON.stringify(existing));
    }

    clearOfflineData() {
        localStorage.removeItem('offlineData');
    }

    showSyncNotification() {
        // Show a notification that sync completed
        if ('serviceWorker' in navigator && 'Notification' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('meowCHAT', {
                    body: 'Offline data synced successfully',
                    icon: '/static/images/fav.png',
                    badge: '/static/images/fav.png'
                });
            });
        }
    }

    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                // Register background sync
                registration.sync.register('background-sync');
            });
        }
    }

    // Cache management
    async clearOldCaches() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            const currentCaches = ['meowchat-static-v1.0.0', 'meowchat-dynamic-v1.0.0'];
            
            for (const cacheName of cacheNames) {
                if (!currentCaches.includes(cacheName)) {
                    await caches.delete(cacheName);
                    console.log('Deleted old cache:', cacheName);
                }
            }
        }
    }

    // App shortcuts - Disabled to avoid redundancy with bottom navigation
    setupAppShortcuts() {
        // Don't create app shortcuts since bottom navigation already exists
    }

    createShortcuts() {
        // Disabled - bottom navigation handles this
    }

    // Splash screen - Only show once on initial app load
    showSplashScreen() {
        // Only show splash screen if this is the first time loading the app
        // and we're on the dashboard (main entry point)
        if (sessionStorage.getItem('splashShown') || window.location.pathname !== '/dashboard') {
            return;
        }
        
        const splash = document.createElement('div');
        splash.className = 'pwa-splash';
        splash.innerHTML = `
            <div class="pwa-splash-content">
                <img src="/static/images/fav.png" alt="meowCHAT">
                <h1>meowCHAT</h1>
                <p>Loading...</p>
            </div>
        `;
        document.body.appendChild(splash);

        // Mark splash as shown
        sessionStorage.setItem('splashShown', 'true');

        // Hide splash screen after a short delay
        setTimeout(() => {
            splash.classList.add('hide');
            setTimeout(() => {
                splash.remove();
            }, 300);
        }, 1500);
    }

    // Install prompt functionality
    setupInstallPrompt() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            
            // Show our custom install prompt
            this.showInstallPrompt();
        });
        
        // Listen for successful installation
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallPrompt();
            // Clear the deferredPrompt
            this.deferredPrompt = null;
        });
    }
    
    showInstallPrompt() {
        // Don't show if already shown recently or if user dismissed it
        if (localStorage.getItem('installPromptDismissed') || 
            localStorage.getItem('installPromptShown')) {
            return;
        }
        
        // Mark as shown
        localStorage.setItem('installPromptShown', 'true');
        
        // Create install prompt
        const prompt = document.createElement('div');
        prompt.className = 'install-prompt';
        prompt.innerHTML = `
            <div class="install-prompt-content">
                <div class="install-prompt-icon">
                    <img src="/static/images/fav.png" alt="meowCHAT">
                </div>
                <div class="install-prompt-text">
                    <h3>Install meowCHAT</h3>
                    <p>Add to home screen for quick access and offline use</p>
                </div>
                <button class="install-btn" onclick="window.pwaUtils.installApp()">
                    <i class="fas fa-download"></i>
                    Install
                </button>
                <button class="close-btn" onclick="window.pwaUtils.hideInstallPrompt()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideInstallPrompt();
        }, 10000);
    }
    
    hideInstallPrompt() {
        const prompt = document.querySelector('.install-prompt');
        if (prompt) {
            prompt.remove();
        }
    }
    
    async installApp() {
        if (this.deferredPrompt) {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            
            // Clear the deferredPrompt
            this.deferredPrompt = null;
            
            // Hide our custom prompt
            this.hideInstallPrompt();
        } else {
            // Fallback for browsers that don't support beforeinstallprompt
            this.showManualInstallInstructions();
        }
    }
    
    showManualInstallInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'install-instructions';
        instructions.innerHTML = `
            <div class="install-instructions-content">
                <h3>Install meowCHAT</h3>
                <p>To install this app:</p>
                <ul>
                    <li><strong>Chrome/Edge:</strong> Tap the menu (⋮) and select "Add to Home screen"</li>
                    <li><strong>Safari:</strong> Tap the share button and select "Add to Home Screen"</li>
                    <li><strong>Firefox:</strong> Tap the menu and select "Add to Home Screen"</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">
                    Got it
                </button>
            </div>
        `;
        
        document.body.appendChild(instructions);
    }

    // Reset splash screen state (for testing or updates)
    resetSplashScreen() {
        sessionStorage.removeItem('splashShown');
    }

    // Performance monitoring
    trackPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                
                // Send performance data to analytics if needed
                this.sendPerformanceData(perfData);
            });
        }
    }

    sendPerformanceData(perfData) {
        // You can implement analytics tracking here
        const data = {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            timestamp: Date.now()
        };
        
        // Send to your analytics endpoint
        // fetch('/api/analytics/performance', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
    }
}

// Enhanced Notification Management System
class NotificationManager {
    constructor() {
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        this.permission = 'default';
        this.subscription = null;
        this.vapidPublicKey = null;
        this.notificationSettings = {
            messages: true,
            likes: true,
            comments: true,
            friendRequests: true,
            general: true
        };
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            console.log('Push notifications not supported');
            return;
        }

        // Load saved settings
        this.loadSettings();
        
        // Check current permission
        this.permission = Notification.permission;
        
        // Get VAPID public key
        await this.getVapidPublicKey();
        
        // Check for existing subscription
        await this.checkExistingSubscription();
        
        // Setup notification UI
        this.setupNotificationUI();
        
        // Register for push events
        this.registerPushEvents();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('notificationSettings');
            if (saved) {
                this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading notification settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    }

    async getVapidPublicKey() {
        try {
            const response = await fetch('/api/notifications/vapid-public-key');
            if (response.ok) {
                const data = await response.json();
                this.vapidPublicKey = data.key;
            }
        } catch (error) {
            console.error('Error getting VAPID public key:', error);
        }
    }

    async checkExistingSubscription() {
        try {
            const registration = await navigator.serviceWorker.ready;
            this.subscription = await registration.pushManager.getSubscription();
            
            if (this.subscription) {
                console.log('Existing push subscription found');
                // Verify subscription is still valid on server
                await this.verifySubscription();
            }
        } catch (error) {
            console.error('Error checking existing subscription:', error);
        }
    }

    async verifySubscription() {
        try {
            const response = await fetch('/api/notifications/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscription: this.subscription
                })
            });
            
            if (!response.ok) {
                console.log('Subscription verification failed, removing subscription');
                await this.unsubscribe();
            }
        } catch (error) {
            console.error('Error verifying subscription:', error);
        }
    }

    setupNotificationUI() {
        // Create notification settings UI
        this.createNotificationSettingsUI();
        
        // Show notification prompt if needed
        this.showNotificationPrompt();
    }

    createNotificationSettingsUI() {
        // Remove existing notification UI
        const existing = document.getElementById('notification-settings');
        if (existing) {
            existing.remove();
        }

        // Create notification settings container
        const container = document.createElement('div');
        container.id = 'notification-settings';
        container.className = 'notification-settings';
        container.innerHTML = `
            <div class="notification-settings-content">
                <div class="notification-header">
                    <h3><i class="fas fa-bell"></i> Notification Settings</h3>
                    <button class="close-btn" onclick="window.pwaUtils.notificationManager.hideSettings()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notification-status">
                    <div class="status-indicator ${this.permission === 'granted' ? 'enabled' : 'disabled'}">
                        <i class="fas fa-${this.permission === 'granted' ? 'check-circle' : 'times-circle'}"></i>
                        <span>${this.permission === 'granted' ? 'Notifications Enabled' : 'Notifications Disabled'}</span>
                    </div>
                </div>
                <div class="notification-options">
                    <label class="notification-option">
                        <input type="checkbox" id="notify-messages" ${this.notificationSettings.messages ? 'checked' : ''}>
                        <span>New Messages</span>
                    </label>
                    <label class="notification-option">
                        <input type="checkbox" id="notify-likes" ${this.notificationSettings.likes ? 'checked' : ''}>
                        <span>Post Likes</span>
                    </label>
                    <label class="notification-option">
                        <input type="checkbox" id="notify-comments" ${this.notificationSettings.comments ? 'checked' : ''}>
                        <span>Post Comments</span>
                    </label>
                    <label class="notification-option">
                        <input type="checkbox" id="notify-friend-requests" ${this.notificationSettings.friendRequests ? 'checked' : ''}>
                        <span>Friend Requests</span>
                    </label>
                    <label class="notification-option">
                        <input type="checkbox" id="notify-general" ${this.notificationSettings.general ? 'checked' : ''}>
                        <span>General Updates</span>
                    </label>
                </div>
                <div class="notification-actions">
                    ${this.permission === 'granted' ? 
                        `<button class="btn btn-secondary" onclick="window.pwaUtils.notificationManager.unsubscribe()">
                            <i class="fas fa-bell-slash"></i> Disable Notifications
                        </button>` :
                        `<button class="btn btn-primary" onclick="window.pwaUtils.notificationManager.requestPermission()">
                            <i class="fas fa-bell"></i> Enable Notifications
                        </button>`
                    }
                </div>
            </div>
        `;

        // Add event listeners for checkboxes
        container.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.updateNotificationSetting(e.target.id.replace('notify-', ''), e.target.checked);
            }
        });

        document.body.appendChild(container);
    }

    showNotificationPrompt() {
        // Don't show if already granted or recently dismissed
        if (this.permission === 'granted' || 
            localStorage.getItem('notificationPromptDismissed') ||
            localStorage.getItem('notificationPromptShown')) {
            return;
        }

        // Mark as shown
        localStorage.setItem('notificationPromptShown', 'true');

        // Create notification prompt
        const prompt = document.createElement('div');
        prompt.className = 'notification-prompt';
        prompt.innerHTML = `
            <div class="notification-prompt-content">
                <div class="notification-prompt-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="notification-prompt-text">
                    <h3>Stay Updated!</h3>
                    <p>Get notified when someone likes your posts, sends you a message, or requests to be your friend.</p>
                </div>
                <div class="notification-prompt-actions">
                    <button class="btn btn-primary" onclick="window.pwaUtils.notificationManager.requestPermission()">
                        <i class="fas fa-bell"></i> Enable Notifications
                    </button>
                    <button class="btn btn-secondary" onclick="window.pwaUtils.notificationManager.dismissPrompt()">
                        Not Now
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(prompt);

        // Auto-hide after 15 seconds
        setTimeout(() => {
            this.dismissPrompt();
        }, 15000);
    }

    dismissPrompt() {
        const prompt = document.querySelector('.notification-prompt');
        if (prompt) {
            prompt.remove();
        }
        localStorage.setItem('notificationPromptDismissed', 'true');
    }

    showSettings() {
        const settings = document.getElementById('notification-settings');
        if (settings) {
            settings.classList.add('show');
        }
    }

    hideSettings() {
        const settings = document.getElementById('notification-settings');
        if (settings) {
            settings.classList.remove('show');
        }
    }

    async requestPermission() {
        if (!this.isSupported) {
            this.showError('Push notifications are not supported in this browser');
            return;
        }

        try {
            // Request notification permission
            const permission = await Notification.requestPermission();
            this.permission = permission;

            if (permission === 'granted') {
                // Subscribe to push notifications
                await this.subscribe();
                
                // Hide prompt and show success
                this.dismissPrompt();
                this.showSuccess('Notifications enabled successfully!');
                
                // Update UI
                this.createNotificationSettingsUI();
                
                // Trigger permission change callback
                if (this.onPermissionChange) {
                    this.onPermissionChange(permission);
                }
            } else {
                this.showError('Notification permission denied');
                
                // Trigger permission change callback
                if (this.onPermissionChange) {
                    this.onPermissionChange(permission);
                }
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            this.showError('Failed to enable notifications');
        }
    }

    async subscribe() {
        if (!this.vapidPublicKey) {
            console.error('VAPID public key not available');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Convert VAPID key
            const vapidKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
            
            // Subscribe to push notifications
            this.subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey
            });

            // Send subscription to server
            await this.sendSubscriptionToServer();

            console.log('Push subscription successful');
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            throw error;
        }
    }

    async unsubscribe() {
        try {
            if (this.subscription) {
                await this.subscription.unsubscribe();
                this.subscription = null;
            }

            // Remove from server
            await this.removeSubscriptionFromServer();

            // Update permission state
            this.permission = 'denied';
            
            // Update UI
            this.createNotificationSettingsUI();
            
            this.showSuccess('Notifications disabled successfully');
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            this.showError('Failed to disable notifications');
        }
    }

    async sendSubscriptionToServer() {
        try {
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscription: this.subscription
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send subscription to server');
            }

            console.log('Subscription sent to server successfully');
        } catch (error) {
            console.error('Error sending subscription to server:', error);
            throw error;
        }
    }

    async removeSubscriptionFromServer() {
        try {
            const response = await fetch('/api/notifications/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscription: this.subscription
                })
            });

            if (!response.ok) {
                console.error('Failed to remove subscription from server');
            }
        } catch (error) {
            console.error('Error removing subscription from server:', error);
        }
    }

    updateNotificationSetting(type, enabled) {
        this.notificationSettings[type] = enabled;
        this.saveSettings();
        
        // Send updated settings to server
        this.sendSettingsToServer();
    }

    async sendSettingsToServer() {
        try {
            const response = await fetch('/api/notifications/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    settings: this.notificationSettings
                })
            });

            if (!response.ok) {
                console.error('Failed to save notification settings to server');
            }
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    }

    registerPushEvents() {
        // Listen for push events from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'PUSH_RECEIVED') {
                this.handlePushReceived(event.data);
            }
        });
    }

    handlePushReceived(data) {
        // Handle push notification received
        console.log('Push notification received:', data);
        
        // Update notification count if needed
        this.updateNotificationCount();
    }

    updateNotificationCount() {
        // Update notification badge/count in UI
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            // Increment count or show indicator
            badge.style.display = 'block';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Utility function to convert VAPID key
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Test notification function
    async testNotification() {
        if (this.permission !== 'granted') {
            this.showError('Notifications not enabled');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification('Test Notification', {
                body: 'This is a test notification from meowCHAT',
                icon: '/static/images/fav.png',
                badge: '/static/images/fav.png',
                tag: 'test',
                requireInteraction: true
            });
        } catch (error) {
            console.error('Error showing test notification:', error);
            this.showError('Failed to show test notification');
        }
    }
}

// Initialize PWA utilities when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pwaUtils = new PWAUtils();
    
    // Show splash screen only for standalone mode (installed PWA) and only once
    if (window.matchMedia('(display-mode: standalone)').matches) {
        window.pwaUtils.showSplashScreen();
    }
    
    // Setup app shortcuts
    window.pwaUtils.setupAppShortcuts();
    
    // Track performance
    window.pwaUtils.trackPerformance();
});

// Export for use in other scripts
window.PWAUtils = PWAUtils;
