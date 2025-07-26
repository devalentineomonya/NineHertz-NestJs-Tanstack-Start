// Service Worker for Push Notifications
// Place this file in public/sw.js

console.log('Service Worker: Loading...');

const CACHE_NAME = 'medic-app-v1';

// Environment detection for service workers
// Option 1: Use hostname to detect environment
const isDevelopment = self.location.hostname === 'localhost' ||
                     self.location.hostname === '127.0.0.1' ||
                     self.location.hostname === 'react.dev.lo';

const BACKEND_URL = isDevelopment ? 'https://nest.dev.lo' : 'https://api.mmedic.devalentine.me';

console.log('Service Worker Environment:', {
  hostname: self.location.hostname,
  isDevelopment,
  backendUrl: BACKEND_URL
});

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  // In development, skip waiting to ensure updates are applied immediately
  if (isDevelopment) {
    console.log('🔧 Development mode: Skipping waiting for immediate updates');
    self.skipWaiting();
  }
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  // In development, clear all caches to avoid stale content
  if (isDevelopment) {
    console.log('🔧 Development mode: Clearing all caches');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('🗑️ Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        return self.clients.claim();
      })
    );
  } else {
    event.waitUntil(self.clients.claim());
  }
});

// Add debugging for all service worker events
self.addEventListener('message', (event) => {
  console.log('Service Worker: Received message from client:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'DEBUG_SW') {
    console.log('Service Worker: Debug info requested');
    // Send back service worker status
    event.ports[0].postMessage({
      type: 'SW_STATUS',
      status: 'active',
      registration: self.registration.scope,
      pushSubscription: 'checking...'
    });
  }
});

// Basic fetch handler for offline support - DISABLED IN DEVELOPMENT
self.addEventListener('fetch', (event) => {
  // Skip all fetch handling in development to avoid interfering with HMR
  if (isDevelopment) {
    console.log('🔧 Development mode: Skipping fetch interception for HMR compatibility');
    return;
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  // Skip hot-reload and development requests
  if (event.request.url.includes('__vite') ||
      event.request.url.includes('hot-update') ||
      event.request.url.includes('?t=') ||
      event.request.url.includes('@vite') ||
      event.request.url.includes('sockjs-node')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((fetchResponse) => {
          // Clone the response before caching
          const responseClone = fetchResponse.clone();

          // Cache successful responses
          if (fetchResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return fetchResponse;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return new Response('App is offline', {
              headers: { 'Content-Type': 'text/html' }
            });
          }
        });
      })
  );
});

// PUSH NOTIFICATION HANDLERS

// Listen for push events - THIS IS THE CRITICAL PART
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push event received!', event);
  console.log('🔔 Event type:', event.type);
  console.log('🔔 Event isTrusted:', event.isTrusted);
  console.log('🔔 Event data exists:', !!event.data);

  if (!event.data) {
    console.log('❌ Service Worker: Push event has no data - this might be the DevTools test push');

    // Show a test notification for DevTools push
    event.waitUntil(
      self.registration.showNotification('Test Push from DevTools', {
        body: 'This is a test push notification from Chrome DevTools',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-push',
        data: { url: '/notifications', source: 'devtools' },
      })
    );
    return;
  }

  let data;
  let rawData;

  try {
    // Get raw data first
    rawData = event.data.text();
    console.log('📨 Service Worker: Raw push data (text):', rawData);
    console.log('📨 Service Worker: Raw push data length:', rawData.length);
    console.log('📨 Service Worker: Raw push data type:', typeof rawData);

    // Try to parse as JSON
    if (rawData.trim()) {
      try {
        data = JSON.parse(rawData);
        console.log('✅ Service Worker: Successfully parsed JSON data:', data);
      } catch (jsonError) {
        console.log('⚠️ Service Worker: Not valid JSON, treating as plain text');
        console.log('⚠️ JSON parse error:', jsonError.message);
        data = {
          title: 'New Notification',
          message: rawData,
          body: rawData
        };
      }
    } else {
      console.log('❌ Service Worker: Empty push data received');
      data = {
        title: 'Empty Push',
        message: 'Received empty push notification',
        body: 'Received empty push notification'
      };
    }
  } catch (error) {
    console.error('❌ Service Worker: Error reading push data:', error);
    data = {
      title: 'Push Error',
      message: 'Error processing push notification',
      body: 'Error processing push notification'
    };
  }

  console.log('📤 Service Worker: Final notification data:', data);

  const options = {
    body: data.body || data.message || 'You have a new notification',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.id || `notification-${Date.now()}`,
    data: {
      id: data.id,
      eventType: data.eventType,
      appointmentId: data.appointmentId,
      url: data.url || '/notifications',
      message: data.message || data.body,
      source: 'backend',
      timestamp: Date.now(),
      rawData: rawData,
      ...data.data,
    },
    requireInteraction: true,
    actions: data.actions || [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    silent: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
  };

  console.log('📤 Service Worker: Notification options:', options);

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'New Notification',
      options
    ).then(() => {
      console.log('✅ Service Worker: Notification shown successfully');

      // Send message to all clients to show toast if app is visible
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          console.log(`📱 Service Worker: Found ${clients.length} client(s) to notify`);

          clients.forEach(client => {
            console.log('📱 Sending toast message to client:', client.url);
            client.postMessage({
              type: 'SHOW_TOAST',
              data: {
                message: data.message || data.body || 'You have a new notification',
                title: data.title || 'New Notification',
                id: data.id,
                source: 'push'
              }
            });
          });
        });
    }).catch((error) => {
      console.error('❌ Service Worker: Error showing notification:', error);
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Service Worker: Notification clicked', event.notification);
  console.log('🖱️ Action:', event.action);
  console.log('🖱️ Notification data:', event.notification.data);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'dismiss') {
    console.log('❌ Service Worker: Notification dismissed via action');
    return;
  }

  const urlToOpen = data?.url || '/notifications';
  console.log('🔗 Service Worker: Opening URL:', urlToOpen);

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        console.log(`🖱️ Service Worker: Found ${clients.length} client(s) for click handling`);

        // Check if there's already a window/tab open
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            console.log('🎯 Service Worker: Focusing existing client:', client.url);

            // Send message to existing client
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: data,
            });

            // Navigate to the URL if needed
            if (urlToOpen !== '/' && !client.url.includes(urlToOpen)) {
              client.postMessage({
                type: 'NAVIGATE_TO',
                url: urlToOpen,
              });
            }

            return client.focus();
          }
        }

        // Open new window if no existing client found
        console.log('🆕 Service Worker: Opening new window for:', urlToOpen);
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error handling notification click:', error);
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Service Worker: Notification closed', event.notification.data);

  const data = event.notification.data;
  if (data?.id) {
    // Track notification dismissal (fire and forget)
    fetch(`${BACKEND_URL}/notifications/dismissed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: data.id }),
    }).catch((err) => console.log('Service Worker: Failed to track dismissal', err));
  }
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Service Worker: Push subscription changed');

  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey()),
      })
      .then((subscription) => {
        console.log('🔄 Service Worker: Resubscribed to push:', subscription.endpoint);
        return fetch(`${BACKEND_URL}/notifications/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker: Failed to resubscribe to push notifications', error);
      })
  );
});

// Get VAPID public key - REPLACE WITH YOUR ACTUAL KEY
function getVapidPublicKey() {
  // Replace this with your actual VAPID public key from your environment
  return 'BGvHI2qy1GtNDPwXhmvsZK43ewLHx95A-2w9FJhL4GauJ-qW5d5CN-AghF800MukJqNC1NcRcdUrWI9XxTAR5t4';
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    console.warn('⚠️ Service Worker: No VAPID public key provided');
    return new Uint8Array();
  }

  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = self.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Log when service worker is ready
console.log('✅ Service Worker: Fully loaded and ready for push notifications');
