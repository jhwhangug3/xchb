// PWA Utilities and Offline Functionality
class PWAUtils {
    constructor() {
        this.isOnline = navigator.onLine;
        this.currentVersion = 'v1.0.1';
        this.updateCheckInterval = null;
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
        this.setupPullToRefresh();
        this.setupHapticFeedback();
        this.setupSwipeGestures();
        this.setupPushNotifications(); // Add push notifications
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

    // Push notification functionality
    setupPushNotifications() {
        this.subscription = null;
        this.setupNotificationPermission();
    }
    
    async setupNotificationPermission() {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }
        
        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
            console.log('This browser does not support service workers');
            return;
        }
        
        // Request permission
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.subscribeToPushNotifications();
            }
        } else if (Notification.permission === 'granted') {
            this.subscribeToPushNotifications();
        }
    }
    
    async subscribeToPushNotifications() {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                this.subscription = existingSubscription;
                console.log('Already subscribed to push notifications');
                this.updateNotificationButtons(true);
                return;
            }
            
            // Get VAPID public key from server
            const vapidResponse = await fetch('/api/notifications/vapid-public-key');
            const vapidData = await vapidResponse.json();
            const vapidPublicKey = vapidData.publicKey;
            
            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
            });
            
            this.subscription = subscription;
            console.log('Subscribed to push notifications:', subscription);
            
            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
            
            // Update UI
            this.updateNotificationButtons(true);
            
            // Show success message
            this.showToast('Push notifications enabled!', 'success');
            
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            this.showToast('Failed to enable notifications', 'error');
        }
    }
    
    async sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    userId: this.getCurrentUserId()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Subscription sent to server:', result);
            
        } catch (error) {
            console.error('Failed to send subscription to server:', error);
        }
    }
    
    getCurrentUserId() {
        // Get user ID from session or localStorage
        return localStorage.getItem('userId') || 'anonymous';
    }
    
    getVapidPublicKey() {
        // This should be your VAPID public key
        // You can generate this using web-push library
        return 'BEl62iUYgUivxIkv69yViEuiBIa1lQJYlX8fXGXKzJvM7vC6lWJVzVcVuMA5R5FPRL0fXFAYxB2dJDLXzgxdkXJY';
    }
    
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
    
    // Test push notification
    async testPushNotification() {
        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.getCurrentUserId(),
                    title: 'Test Notification',
                    body: 'This is a test notification from meowCHAT!',
                    icon: '/static/images/fav.png',
                    url: '/dashboard'
                })
            });
            
            if (response.ok) {
                this.showToast('Test notification sent!', 'success');
            } else {
                throw new Error(`Server responded with ${response.status}`);
            }
            
        } catch (error) {
            console.error('Failed to send test notification:', error);
            this.showToast('Failed to send test notification', 'error');
        }
    }
    
    // Update notification buttons UI
    updateNotificationButtons(isSubscribed) {
        const enableBtn = document.getElementById('enableNotifications');
        const testBtn = document.getElementById('testNotification');
        const disableBtn = document.getElementById('disableNotifications');
        
        if (enableBtn && testBtn && disableBtn) {
            if (isSubscribed) {
                enableBtn.style.display = 'none';
                testBtn.style.display = 'inline-flex';
                disableBtn.style.display = 'inline-flex';
            } else {
                enableBtn.style.display = 'inline-flex';
                testBtn.style.display = 'none';
                disableBtn.style.display = 'none';
            }
        }
    }
    
    // Check notification status on load
    async checkNotificationStatus() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                this.subscription = subscription;
                this.updateNotificationButtons(true);
            } else {
                this.updateNotificationButtons(false);
            }
        } catch (error) {
            console.error('Error checking notification status:', error);
        }
    }

    // Unsubscribe from push notifications
    async unsubscribeFromPushNotifications() {
        try {
            if (this.subscription) {
                await this.subscription.unsubscribe();
                this.subscription = null;
                
                // Notify server
                await fetch('/api/notifications/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: this.getCurrentUserId()
                    })
                });
                
                // Update UI
                this.updateNotificationButtons(false);
                
                this.showToast('Push notifications disabled', 'info');
            }
        } catch (error) {
            console.error('Failed to unsubscribe from push notifications:', error);
        }
    }

    // Haptic feedback functionality
    setupHapticFeedback() {
        // Check if device supports haptic feedback
        this.supportsHaptic = 'vibrate' in navigator;
    }
    
    triggerHapticFeedback(type = 'light') {
        if (!this.supportsHaptic) return;
        
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [50, 100, 50],
            warning: [20, 50, 20]
        };
        
        navigator.vibrate(patterns[type] || patterns.light);
    }
    
    // Swipe gestures functionality
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let isSwiping = false;
        const swipeThreshold = 50;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwiping = true;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // Prevent vertical scrolling if horizontal swipe is detected
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Detect swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > swipeThreshold) {
                if (deltaY > 0) {
                    this.handleSwipeDown();
                } else {
                    this.handleSwipeUp();
                }
            }
            
            isSwiping = false;
        });
    }
    
    handleSwipeRight() {
        // Navigate back or open menu
        this.triggerHapticFeedback('light');
        console.log('Swiped right');
    }
    
    handleSwipeLeft() {
        // Navigate forward or close menu
        this.triggerHapticFeedback('light');
        console.log('Swiped left');
    }
    
    handleSwipeUp() {
        // Scroll up or show more options
        this.triggerHapticFeedback('light');
        console.log('Swiped up');
    }
    
    handleSwipeDown() {
        // Scroll down or hide options
        this.triggerHapticFeedback('light');
        console.log('Swiped down');
    }
    
    // Toast notifications
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger haptic feedback
        this.triggerHapticFeedback(type === 'error' ? 'error' : 'light');
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }
    
    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
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

    // Pull-to-refresh functionality
    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        let pullThreshold = 80;
        
        const container = document.querySelector('.container') || document.body;
        
        // Touch events
        container.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            currentY = e.touches[0].clientY;
            const pullDistance = currentY - startY;
            
            if (pullDistance > 0 && window.scrollY === 0) {
                e.preventDefault();
                this.showPullIndicator(pullDistance);
            }
        });
        
        container.addEventListener('touchend', () => {
            if (!isPulling) return;
            
            const pullDistance = currentY - startY;
            
            if (pullDistance > pullThreshold) {
                this.triggerRefresh();
            }
            
            this.hidePullIndicator();
            isPulling = false;
        });
    }
    
    showPullIndicator(pullDistance) {
        let indicator = document.querySelector('.pull-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'pull-indicator';
            indicator.innerHTML = `
                <div class="pull-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="pull-text">Pull to refresh</div>
            `;
            document.body.appendChild(indicator);
        }
        
        const progress = Math.min(pullDistance / 80, 1);
        indicator.style.transform = `translateY(${pullDistance}px)`;
        
        if (pullDistance > 80) {
            indicator.querySelector('.pull-text').textContent = 'Release to refresh';
        } else {
            indicator.querySelector('.pull-text').textContent = 'Pull to refresh';
        }
    }
    
    hidePullIndicator() {
        const indicator = document.querySelector('.pull-indicator');
        if (indicator) {
            indicator.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.remove();
                }
            }, 300);
        }
    }
    
    async triggerRefresh() {
        // Show loading state
        this.showRefreshLoading();
        
        // Trigger haptic feedback
        this.triggerHapticFeedback('success');
        
        // Simulate refresh (you can replace this with actual data refresh)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Hide loading state
        this.hideRefreshLoading();
        
        // Show success message
        this.showToast('Refreshed!', 'success');
    }
    
    showRefreshLoading() {
        const loading = document.createElement('div');
        loading.className = 'refresh-loading';
        loading.innerHTML = `
            <div class="refresh-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="refresh-text">Refreshing...</div>
        `;
        document.body.appendChild(loading);
    }
    
    hideRefreshLoading() {
        const loading = document.querySelector('.refresh-loading');
        if (loading) {
            loading.remove();
        }
    }

    // Haptic feedback functionality
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
    
    // Check notification status
    window.pwaUtils.checkNotificationStatus();
});

// Export for use in other scripts
window.PWAUtils = PWAUtils;
