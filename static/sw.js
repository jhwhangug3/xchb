const CACHE_NAME = 'meowchat-v1.0.2';
const STATIC_CACHE = 'meowchat-static-v1.0.2';
const DYNAMIC_CACHE = 'meowchat-dynamic-v1.0.2';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/messaging',
  '/notifications',
  '/create-post',
  '/profile',
  '/offline',
  '/static/css/main.css',
  '/static/images/fav.png',
  '/static/images/nav.png',
  '/static/js/pwa-utils.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// Version check endpoint
const VERSION_CHECK_URL = '/api/pwa/version';

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker install failed:', error);
      })
  );
});

// Activate event - clean up old caches and check for updates
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      cleanOldCaches(),
      checkForUpdates(),
      self.clients.claim()
    ])
  );
});

// Clean up old caches
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map((cacheName) => {
      if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
        console.log('Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

// Check for updates
async function checkForUpdates() {
  try {
    const response = await fetch(VERSION_CHECK_URL, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const serverVersion = data.version;
      const currentVersion = CACHE_NAME.split('-')[1];
      
      if (serverVersion !== currentVersion) {
        console.log('New version available:', serverVersion);
        // Notify all clients about the update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            version: serverVersion
          });
        });
        
        // Clear all caches to force fresh content
        await clearAllCaches();
      }
    }
  } catch (error) {
    console.error('Version check failed:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static files
  if (url.pathname.startsWith('/static/') || 
      url.hostname.includes('cdn.jsdelivr.net') || 
      url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle page requests
  event.respondWith(handlePageRequest(request));
});

// Handle API requests - network first, cache fallback
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful API responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Try to serve from cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return a simple error response
    return new Response(JSON.stringify({ error: 'Network error' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static files - cache first, network fallback
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return a simple fallback for critical resources
    if (request.url.includes('bootstrap.min.css')) {
      return new Response('/* Bootstrap fallback */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    throw error;
  }
}

// Handle page requests - network first, cache fallback
async function handlePageRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful page responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Try to serve from cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline');
  }
}

// Enhanced push notification handling
self.addEventListener('push', (event) => {
    console.log('Push event received:', event);
    
    try {
        const data = event.data ? event.data.json() : {};
        const title = data.title || 'meowCHAT';
        const body = data.body || 'New notification';
        const url = data.url || '/dashboard';
        const icon = data.icon || '/static/images/fav.png';
        const badge = data.badge || '/static/images/fav.png';
        const tag = data.tag || 'default';
        const requireInteraction = data.requireInteraction !== false;
        
        // Create notification options
        const options = {
            body,
            icon,
            badge,
            data: { 
                url,
                notificationType: data.type || 'general',
                senderId: data.sender_id,
                chatSessionId: data.chat_session_id,
                postId: data.post_id
            },
            requireInteraction,
            tag,
            vibrate: [200, 100, 200],
            actions: []
        };
        
        // Add actions based on notification type
        if (data.type === 'message') {
            options.actions = [
                {
                    action: 'reply',
                    title: 'Reply',
                    icon: '/static/images/fav.png'
                },
                {
                    action: 'view',
                    title: 'View Chat',
                    icon: '/static/images/fav.png'
                }
            ];
        } else if (data.type === 'like') {
            options.actions = [
                {
                    action: 'view',
                    title: 'View Post',
                    icon: '/static/images/fav.png'
                }
            ];
        } else if (data.type === 'friend_request') {
            options.actions = [
                {
                    action: 'accept',
                    title: 'Accept',
                    icon: '/static/images/fav.png'
                },
                {
                    action: 'view',
                    title: 'View Profile',
                    icon: '/static/images/fav.png'
                }
            ];
        } else {
            // Default actions for general notifications
            options.actions = [
                {
                    action: 'open',
                    title: 'Open',
                    icon: '/static/images/fav.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/static/images/fav.png'
                }
            ];
        }
        
        event.waitUntil(self.registration.showNotification(title, options));
        
        // Store notification data for later use
        if (data.type) {
            storeNotificationData(data);
        }
        
    } catch (error) {
        console.error('Error handling push notification:', error);
        // Fallback notification
        event.waitUntil(self.registration.showNotification('meowCHAT', { 
            body: 'New notification',
            icon: '/static/images/fav.png',
            badge: '/static/images/fav.png'
        }));
    }
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    const data = event.notification.data || {};
    const action = event.action;
    
    // Handle different actions
    if (action === 'close') {
        return;
    }
    
    let url = data.url || '/dashboard';
    
    // Handle specific actions
    if (action === 'reply' && data.chatSessionId) {
        // Open chat with reply focus
        url = `/chat/${data.senderId}?focus=reply`;
    } else if (action === 'accept' && data.senderId) {
        // Accept friend request
        url = `/api/friends/request/${data.requestId}/accept`;
    } else if (action === 'view') {
        // Use the provided URL or construct based on type
        if (data.notificationType === 'message') {
            url = `/chat/${data.senderId}`;
        } else if (data.notificationType === 'like' && data.postId) {
            url = `/dashboard?post=${data.postId}`;
        } else if (data.notificationType === 'friend_request' && data.senderId) {
            url = `/users/${data.senderId}`;
        }
    }
    
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window/tab open with the target URL
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If so, focus it
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window/tab
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});

// Store notification data for offline access
function storeNotificationData(data) {
    // Store in IndexedDB for offline access
    if ('indexedDB' in self) {
        const request = indexedDB.open('meowchat-notifications', 1);
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('notifications')) {
                db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
            }
        };
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['notifications'], 'readwrite');
            const store = transaction.objectStore('notifications');
            
            const notificationData = {
                ...data,
                timestamp: Date.now(),
                read: false
            };
            
            store.add(notificationData);
        };
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    } else if (event.tag === 'notification-sync') {
        event.waitUntil(syncNotifications());
    }
});

async function doBackgroundSync() {
    try {
        // Sync any pending data when connection is restored
        console.log('Background sync triggered');
        // Check for updates during background sync
        await checkForUpdates();
        
        // Sync notifications
        await syncNotifications();
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

async function syncNotifications() {
    try {
        // Sync any pending notifications
        console.log('Syncing notifications...');
        
        // Check for new notifications from server
        const response = await fetch('/api/notifications/pending', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const notifications = await response.json();
            console.log('Synced notifications:', notifications);
        }
    } catch (error) {
        console.error('Notification sync failed:', error);
    }
}

// Handle message events from main thread
self.addEventListener('message', (event) => {
    console.log('Service worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        event.waitUntil(checkForUpdates());
    }
    
    if (event.data && event.data.type === 'SYNC_NOTIFICATIONS') {
        event.waitUntil(syncNotifications());
    }
    
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon, data } = event.data;
        event.waitUntil(
            self.registration.showNotification(title, {
                body,
                icon: icon || '/static/images/fav.png',
                badge: '/static/images/fav.png',
                data: data || {}
            })
        );
    }
});

// Periodic update checks (every 30 minutes)
setInterval(() => {
    checkForUpdates();
}, 30 * 60 * 1000);

// Periodic notification sync (every 15 minutes)
setInterval(() => {
    syncNotifications();
}, 15 * 60 * 1000);


