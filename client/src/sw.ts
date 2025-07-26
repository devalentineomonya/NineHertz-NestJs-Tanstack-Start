/// <reference lib="webworker" />

import {
  cleanupOutdatedCaches,
  precacheAndRoute,
  PrecacheEntry,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
} from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// Extend service worker global scope
declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: (string | PrecacheEntry)[];
  }
}

// Cast self to ServiceWorkerGlobalScope to access __WB_MANIFEST
const sw = self as unknown as ServiceWorkerGlobalScope;

precacheAndRoute(sw.__WB_MANIFEST);

// Clean old assets
cleanupOutdatedCaches();
clientsClaim();

// Handle navigation requests for TanStack SPA
const navigationHandler = async (params: any) => {
  try {
    const response = await new NetworkFirst().handle(params);
    if (response) {
      return response;
    }
    throw new Error("No response found");
  } catch (error) {
    // Try to return cached index.html or fallback
    const cachedResponse =
      (await caches.match("/index.html")) ||
      (await caches.match("/")) ||
      new Response("Offline - App not available", {
        status: 503,
        statusText: "Service Unavailable",
        headers: {
          "Content-Type": "text/html",
        },
      });
    return cachedResponse;
  }
};

registerRoute(new NavigationRoute(navigationHandler));

// Cache static assets
registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "worker",
  new StaleWhileRevalidate({
    cacheName: "static-assets",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

// Cache images with proper plugins
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// PUSH NOTIFICATION HANDLERS

// Listen for push events
sw.addEventListener("push", (event: PushEvent) => {
  console.log("Push event received:", event);

  if (!event.data) {
    console.log("Push event has no data");
    return;
  }

  try {
    const data = event.data.json();
    console.log("Push data:", data);

    const options: NotificationOptions = {
      body: data.message || data.body || "You have a new notification",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: data.id || "notification",
      data: {
        id: data.id,
        eventType: data.eventType,
        appointmentId: data.appointmentId,
        url: data.url || "/",
        ...data,
      },
      // actions: [
      //   {
      //     action: "view",
      //     title: "View",
      //     icon: "/view-icon.png",
      //   },
      //   {
      //     action: "dismiss",
      //     title: "Dismiss",
      //     icon: "/dismiss-icon.png",
      //   },
      // ],
      requireInteraction: true,
      // vibrate: [100, 50, 100],
      // timestamp: Date.now(),
    };

    event.waitUntil(
      sw.registration.showNotification(
        data.title || "New Notification",
        options
      )
    );
  } catch (error) {
    console.error("Error parsing push data:", error);

    // Fallback notification
    event.waitUntil(
      sw.registration.showNotification("New Notification", {
        body: "You have a new notification",
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        tag: "fallback",
        data: {
          url: "/",
        },
      })
    );
  }
});

// Handle notification clicks
sw.addEventListener("notificationclick", (event: NotificationEvent) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === "dismiss") {
    return;
  }

  const urlToOpen = data?.url || "/notifications";

  event.waitUntil(
    sw.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Check if there's already a window/tab open
        for (const client of clients) {
          if (client.url.includes(sw.location.origin) && "focus" in client) {
            // Send message to existing client
            client.postMessage({
              type: "NOTIFICATION_CLICKED",
              data: data,
            });
            // Navigate to the URL if needed
            if (urlToOpen !== "/" && !client.url.includes(urlToOpen)) {
              client.postMessage({
                type: "NAVIGATE_TO",
                url: urlToOpen,
              });
            }
            return (client as WindowClient).focus();
          }
        }

        // Open new window if no existing client found
        if (sw.clients.openWindow) {
          return sw.clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error("Error handling notification click:", error);
      })
  );
});

// Handle notification close
sw.addEventListener("notificationclose", (event: NotificationEvent) => {
  console.log("Notification closed:", event.notification.data);

  const data = event.notification.data;
  if (data?.id) {
    // Track notification dismissal (fire and forget)
    fetch("/api/notifications/dismissed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: data.id }),
    }).catch((err) => console.log("Failed to track dismissal:", err));
  }
});

// Handle push subscription changes
sw.addEventListener("pushsubscriptionchange", (event: Event) => {
  console.log("Push subscription changed");

  const extendableEvent = event as ExtendableEvent & {
    oldSubscription: PushSubscription | null;
    newSubscription: PushSubscription | null;
  };

  extendableEvent.waitUntil(
    sw.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey()),
      })
      .then((subscription) => {
        return fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: subscription,
            oldSubscription: extendableEvent.oldSubscription,
          }),
        });
      })
      .catch((error) => {
        console.error("Failed to resubscribe to push notifications:", error);
      })
  );
});

// Get VAPID public key from environment or configuration
function getVapidPublicKey(): string {
  // Replace with your actual VAPID public key
  // This should ideally come from your build process or environment
  return "YOUR_VAPID_PUBLIC_KEY_HERE";
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = sw.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
