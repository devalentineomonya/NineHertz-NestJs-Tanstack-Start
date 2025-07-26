// Service Worker for Push Notifications
// Place this file in public/sw.js

console.log('Service Worker: Loading...');

const CACHE_NAME = 'medic-app-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

// Basic fetch handler for offline support
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

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

// Listen for push events
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received', event);

  if (!event.data) {
    console.log('Service Worker: Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Service Worker: Push data', data);

    const options = {
      body: data.body || data.message || 'You have a new notification',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: data.id || 'notification',
      data: {
        id: data.id,
        eventType: data.eventType,
        appointmentId: data.appointmentId,
        url: data.url || '/notifications',
        ...data.data,
      },
      requireInteraction: true,
      actions: data.actions || [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      // Additional options for better UX
      silent: false,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'New Notification',
        options
      )
    );
  } catch (error) {
    console.error('Service Worker: Error parsing push data', error);

    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('New Notification', {
        body: 'You have a new notification',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'fallback',
        data: { url: '/notifications' },
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'dismiss') {
    console.log('Service Worker: Notification dismissed');
    return;
  }

  const urlToOpen = data?.url || '/notifications';
  console.log('Service Worker: Opening URL', urlToOpen);

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        console.log('Service Worker: Found clients', clients.length);

        // Check if there's already a window/tab open
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            console.log('Service Worker: Focusing existing client');

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
        console.log('Service Worker: Opening new window');
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('Service Worker: Error handling notification click', error);
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event.notification.data);

  const data = event.notification.data;
  if (data?.id) {
    // Track notification dismissal (fire and forget)
    fetch('/api/notifications/dismissed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: data.id }),
    }).catch((err) => console.log('Service Worker: Failed to track dismissal', err));
  }
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Service Worker: Push subscription changed');

  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey()),
      })
      .then((subscription) => {
        return fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        });
      })
      .catch((error) => {
        console.error('Service Worker: Failed to resubscribe to push notifications', error);
      })
  );
});

// Get VAPID public key - REPLACE WITH YOUR ACTUAL KEY
function getVapidPublicKey() {
  // Replace this with your actual VAPID public key from your environment
  return 'BI9TlxS2bM7GAKsC4e69VoM7mfLFioZ5UzIDteF0CY90oLhKDdkVug5IXbJbJKkWxC3HXuBe6SM7LgaMqQ9UePU';
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    console.warn('Service Worker: No VAPID public key provided');
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

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Received message', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
