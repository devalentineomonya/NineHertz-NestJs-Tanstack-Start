// Service Worker for Push Notifications
// Version: 1.0.0
// Environment: Production

'use strict';

// Configuration
const CACHE_NAME = 'medic-app-v1';
let BACKEND_URL = null;
let VAPID_PUBLIC_KEY = null;

// Service Worker Lifecycle Events
// ==============================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    // Clean up old caches
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      ).then(() => self.clients.claim());
    })
  );
});

// Message Handling
// ================

self.addEventListener('message', (event) => {
  console.log(`[SW] Received message: ${event.data?.type}`);

  switch (event.data?.type) {
    case 'SET_CONFIG':
      handleSetConfig(event.data.config);
      break;
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'DEBUG_SW':
      handleDebugRequest(event);
      break;
    default:
      console.log(`[SW] Unhandled message type: ${event.data?.type}`);
  }
});

function handleSetConfig(config) {
  BACKEND_URL = config.backendUrl;
  VAPID_PUBLIC_KEY = config.vapidKey;

  console.log('[SW] Configuration set:', {
    backendUrl: BACKEND_URL,
    vapidKey: VAPID_PUBLIC_KEY ? `${VAPID_PUBLIC_KEY.substring(0, 10)}...` : 'null'
  });
}

function handleDebugRequest(event) {
  event.ports[0].postMessage({
    type: 'SW_STATUS',
    status: 'active',
    scope: self.registration.scope,
    config: {
      backendUrl: BACKEND_URL,
      vapidKey: VAPID_PUBLIC_KEY ? 'configured' : 'missing'
    }
  });
}

// Push Notification Handling
// ==========================

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  // Validate configuration
  if (!VAPID_PUBLIC_KEY) {
    console.error('[SW] VAPID key not configured. Cannot handle push.');
    return;
  }

  const notificationData = parsePushData(event);
  const options = buildNotificationOptions(notificationData);

  event.waitUntil(
    showNotification(notificationData.title, options)
      .then(() => notifyClients(notificationData))
      .catch(handleNotificationError)
  );
});

function parsePushData(event) {
  try {
    if (!event.data) {
      console.warn('[SW] Empty push payload received');
      return {
        title: 'New Notification',
        message: 'You have a new notification'
      };
    }

    const textData = event.data.text();
    if (!textData.trim()) {
      return {
        title: 'Empty Notification',
        message: 'Received empty notification payload'
      };
    }

    try {
      return JSON.parse(textData);
    } catch {
      return {
        title: 'New Notification',
        message: textData
      };
    }
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
    return {
      title: 'Notification Error',
      message: 'Error processing notification'
    };
  }
}

function buildNotificationOptions(data) {
  return {
    body: data.message || 'You have a new notification',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.id || `notification-${Date.now()}`,
    data: {
      id: data.id,
      url: data.url || '/notifications',
      ...data
    },
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  };
}

function showNotification(title, options) {
  return self.registration.showNotification(title, options)
    .then(() => console.log('[SW] Notification shown successfully'));
}

function notifyClients(data) {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SHOW_TOAST',
          data: {
            message: data.message || 'You have a new notification',
            title: data.title || 'New Notification',
            id: data.id
          }
        });
      });
    });
}

function handleNotificationError(error) {
  console.error('[SW] Notification error:', error);

  // Report error to backend
  if (BACKEND_URL) {
    fetch(`${BACKEND_URL}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'push_error',
        message: error.message,
        stack: error.stack
      })
    }).catch(console.error);
  }
}

// Notification Interaction
// ========================

self.addEventListener('notificationclick', (event) => {
  console.log(`[SW] Notification clicked: ${event.action}`);
  event.notification.close();

  if (event.action === 'dismiss') {
    handleDismissal(event.notification.data);
    return;
  }

  handleNotificationAction(event);
});

function handleNotificationAction(event) {
  const data = event.notification.data;
  const targetUrl = data.url || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // Try to find existing client to focus
        for (const client of clients) {
          if (isSameOrigin(client.url)) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: data
            });

            if (!client.url.includes(targetUrl)) {
              client.postMessage({
                type: 'NAVIGATE_TO',
                url: targetUrl
              });
            }

            return client.focus();
          }
        }

        // Open new window if no client found
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
}

function handleDismissal(data) {
  if (!BACKEND_URL || !data?.id) return;

  fetch(`${BACKEND_URL}/notifications/dismissed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notificationId: data.id }),
    keepalive: true // Ensure request completes even if SW terminates
  }).catch(console.error);
}

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
  handleDismissal(event.notification.data);
});

// Push Subscription Management
// ============================

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');

  if (!VAPID_PUBLIC_KEY) {
    console.error('[SW] VAPID key missing during subscription change');
    return;
  }

  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
    .then(subscription => {
      console.log('[SW] Resubscribed to push');
      return sendSubscriptionToServer(subscription);
    })
    .catch(error => {
      console.error('[SW] Resubscription failed:', error);
    })
  );
});

function sendSubscriptionToServer(subscription) {
  if (!BACKEND_URL) return Promise.reject('Backend URL not configured');

  return fetch(`${BACKEND_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: subscription.toJSON()
    }),
    keepalive: true
  });
}

// Fetch Handling (Cache-first strategy)
// =====================================

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) return;

  // Skip Vite-specific requests in development
  if (isViteRequest(event.request)) return;

  event.respondWith(
    cacheFirstStrategy(event.request)
  );
});

function isViteRequest(request) {
  return request.url.includes('__vite') ||
         request.url.includes('@vite') ||
         request.url.includes('sockjs-node');
}

function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(cachedResponse => {
      if (cachedResponse) {
        console.log(`[SW] Serving from cache: ${request.url}`);
        return cachedResponse;
      }

      return fetch(request)
        .then(networkResponse => {
          // Only cache successful responses
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('Network error', { status: 503 });
        });
    });
}

// Utility Functions
// =================

function urlBase64ToUint8Array(base64String) {
  if (!base64String) throw new Error('VAPID key is required');

  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const buffer = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    buffer[i] = rawData.charCodeAt(i);
  }

  return buffer;
}

function isSameOrigin(url) {
  try {
    return new URL(url).origin === self.location.origin;
  } catch {
    return false;
  }
}

console.log('[SW] Service worker initialized');
