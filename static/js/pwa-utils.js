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
