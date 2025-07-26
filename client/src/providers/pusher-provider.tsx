import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import Pusher from "pusher-js";
import { toast } from "sonner";
import { PushNotification } from "@/screens/notifications/notifications-page";
import { dataServices } from "@/services/data/data-service";

Pusher.logToConsole = import.meta.env.MODE === "development";

interface PusherContextType {
  notifications: PushNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  isPushSupported: boolean;
  isPushGranted: boolean;
  requestPushPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
}

const PusherContext = createContext<PusherContextType | null>(null);

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const PusherProvider = ({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushGranted, setIsPushGranted] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Check push notification support
  useEffect(() => {
    const checkPushSupport = () => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      console.log("🔍 Push support check:", {
        serviceWorker: "serviceWorker" in navigator,
        pushManager: "PushManager" in window,
        notification: "Notification" in window,
        overall: supported,
        userAgent: navigator.userAgent,
        vapidKey: VAPID_PUBLIC_KEY ? `${VAPID_PUBLIC_KEY.substring(0, 20)}...` : 'NOT SET'
      });

      setIsPushSupported(supported);
      setIsPushGranted(Notification.permission === "granted");

      console.log("🔍 Push permission status:", Notification.permission);

      // Additional checks
      if (!VAPID_PUBLIC_KEY) {
        console.error("❌ VAPID public key is not set! Check your VITE_VAPID_PUBLIC_KEY environment variable");
      }
    };

    checkPushSupport();
  }, []);

  useEffect(() => {
    const setupServiceWorker = async () => {
      if (!isPushSupported) {
        console.log("❌ Push not supported, skipping service worker setup");
        return;
      }

      if (!VAPID_PUBLIC_KEY) {
        console.error("❌ Cannot setup service worker: VAPID public key is missing");
        return;
      }

      // In development, add a small delay to let React finish initializing
      if (import.meta.env.MODE === "development") {
        console.log("🔧 Development mode: Adding initialization delay...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      try {
        console.log("📝 Registering service worker...");

        // Register service worker from public directory with development-friendly options
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          // In development, update the service worker immediately
          updateViaCache: import.meta.env.MODE === "development" ? 'none' : 'imports',
        });

        console.log("✅ Service worker registered:", registration);

        // In development, force update if there's a waiting service worker
        if (import.meta.env.MODE === "development" && registration.waiting) {
          console.log("🔧 Development mode: Activating waiting service worker");
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Wait for it to be ready
        const readyRegistration = await navigator.serviceWorker.ready;
        swRegistrationRef.current = readyRegistration;

        console.log("✅ Service Worker ready:", {
          scope: readyRegistration.scope,
          updateViaCache: readyRegistration.updateViaCache,
          installing: !!readyRegistration.installing,
          waiting: !!readyRegistration.waiting,
          active: !!readyRegistration.active
        });

        // Check current push subscription
        const existingSubscription = await readyRegistration.pushManager.getSubscription();
        console.log("🔍 Existing push subscription:", existingSubscription ? {
          endpoint: existingSubscription.endpoint,
          expirationTime: existingSubscription.expirationTime
        } : "None");

        // Send configuration to service worker
        if (readyRegistration.active) {
          readyRegistration.active.postMessage({
            type: 'SET_CONFIG',
            config: {
              backendUrl: import.meta.env.MODE === "development" ? 'https://nest.dev.lo' : 'https://api.mmedic.devalentine.me',
              isDevelopment: import.meta.env.MODE === "development",
              vapidKey: VAPID_PUBLIC_KEY
            }
          });
        }

        navigator.serviceWorker.addEventListener("message", handleSWMessage);

        if (Notification.permission === "granted") {
          console.log("✅ Permission already granted, subscribing to push...");
          await subscribeToPushInternal(readyRegistration);
        }
      } catch (error) {
        console.error("❌ Service Worker registration failed:", error);

        // In development, provide helpful error context
        if (import.meta.env.MODE === "development") {
          console.error("🔧 Development tip: This might be due to HMR conflicts. Try refreshing the page.");

          // Fallback: continue without service worker in development
          console.log("🔧 Continuing without service worker in development mode");
        }
      }
    };

    setupServiceWorker();

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    };
  }, [isPushSupported, userId]);

  // Handle messages from service worker
  const handleSWMessage = (event: MessageEvent) => {
    console.log("📨 SW Message received:", event.data);

    if (event.data.type === "NOTIFICATION_CLICKED") {
      const notificationData = event.data.data;
      console.log("🖱️ Notification clicked in app:", notificationData);

      // Mark as read if ID exists
      if (notificationData.id) {
        markAsRead(notificationData.id);
      }
    } else if (event.data.type === "SHOW_TOAST") {
      const toastData = event.data.data;
      console.log("🍞 Show toast request:", toastData, {
        documentVisible: document.visibilityState === "visible",
        isPushGranted
      });

      // Only show toast if the document is visible and push notifications are granted
      if (document.visibilityState === "visible" && isPushGranted) {
        toast.success(toastData.message, {
          description: toastData.title !== toastData.message ? toastData.title : undefined,
          duration: 4000,
        });
      }
    } else if (event.data.type === "NAVIGATE_TO") {
      const url = event.data.url;
      console.log("🧭 Navigate to:", url);
      // You can handle navigation here if needed
    }
  };

  // Set up Pusher connection
  useEffect(() => {
    if (pusherRef.current) {
      console.log("🔌 Disconnecting existing Pusher connection");
      pusherRef.current.disconnect();
    }

    console.log("🔌 Setting up Pusher connection for user:", userId);

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      forceTLS: true,
    });
    pusherRef.current = pusher;

    pusher.connection.bind(
      "state_change",
      (states: { previous: string; current: string }) => {
        console.log(
          "🔌 Pusher state change:",
          states.previous,
          "->",
          states.current
        );
      }
    );

    const channelName = `user-${userId}`;
    console.log("📡 Subscribing to Pusher channel:", channelName);
    const channel = pusher.subscribe(channelName);

    channel.bind("new-notification", async (data: PushNotification) => {
      console.log("📨 Pusher notification received:", data, {
        documentVisible: document.visibilityState,
        isPushGranted
      });

      // Show toast when app is visible and push is not enabled
      if (!isPushGranted && document.visibilityState === "visible") {
        console.log("🍞 Showing toast (push not granted)");
        toast.success(data.message, {
          description: data.title !== data.message ? data.title : undefined,
          duration: 4000,
        });
      } else {
        console.log("🔕 Not showing toast:", {
          reason: isPushGranted ? "push notifications enabled" : "document not visible"
        });
      }

      // Always update app state
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      console.log("🧹 Cleaning up Pusher connection");
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, [userId, isPushGranted]);

  // Convert VAPID key from base64
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    if (!base64String) {
      console.error("❌ Cannot convert VAPID key: base64String is empty");
      return new Uint8Array();
    }

    try {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      console.log("✅ VAPID key converted successfully, length:", outputArray.length);
      return outputArray;
    } catch (error) {
      console.error("❌ Error converting VAPID key:", error);
      return new Uint8Array();
    }
  };

  // Request push notification permission
  const requestPushPermission = async (): Promise<boolean> => {
    if (!isPushSupported) {
      console.log("❌ Push notifications not supported");
      toast.error("Push notifications are not supported in this browser");
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.error("❌ VAPID public key is not configured");
      toast.error("Push notifications are not properly configured");
      return false;
    }

    console.log("🔔 Requesting push permission...");

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";

      console.log("🔔 Permission result:", permission, "granted:", granted);

      setIsPushGranted(granted);

      if (granted && swRegistrationRef.current) {
        console.log("✅ Permission granted, subscribing to push...");
        await subscribeToPushInternal(swRegistrationRef.current);
        console.log("✅ Set up internal and server subscription to push...");
        toast.success("Push notifications enabled successfully!");
      } else if (!granted) {
        toast.error("Push notification permission was denied");
      }

      return granted;
    } catch (error) {
      console.error("❌ Error requesting notification permission:", error);
      toast.error("Failed to request notification permission");
      return false;
    }
  };

  // Internal subscribe function with better error handling
  const subscribeToPushInternal = async (
    registration: ServiceWorkerRegistration
  ) => {
    if (!VAPID_PUBLIC_KEY) {
      console.error("❌ Cannot subscribe: VAPID public key is missing");
      throw new Error("VAPID public key is not configured");
    }

    try {
      console.log("🔍 Checking for existing push subscription...");

      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        console.log("✅ Push subscription already exists:", {
          endpoint: existingSubscription.endpoint,
          expirationTime: existingSubscription.expirationTime
        });

        // Verify the subscription is still valid
        try {
          await sendSubscriptionToServer(existingSubscription);
          return;
        } catch (error) {
          console.log("⚠️ Existing subscription invalid, creating new one...");
          await existingSubscription.unsubscribe();
        }
      }

      console.log("📝 Creating new push subscription...");
      console.log("🔑 Using VAPID key:", VAPID_PUBLIC_KEY?.substring(0, 20) + "...");

      // Validate VAPID key format
      const vapidKeyArray = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      if (vapidKeyArray.length === 0) {
        throw new Error("Invalid VAPID public key format");
      }

      console.log("🔑 VAPID key array length:", vapidKeyArray.length);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyArray,
      });

      console.log("✅ Push subscription created:", {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: subscription.toJSON().keys ? "Present" : "Missing"
      });

      await sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error("❌ Error subscribing to push:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Registration failed')) {
          console.error("💡 This might be due to:");
          console.error("  1. Invalid VAPID public key");
          console.error("  2. Push service connectivity issues");
          console.error("  3. Browser/OS push service problems");

          toast.error("Failed to register for push notifications. Please check your connection and try again.");
        } else if (error.message.includes('NotSupportedError')) {
          toast.error("Push notifications are not supported in this environment");
        } else if (error.message.includes('InvalidStateError')) {
          toast.error("Service worker is not in a valid state for push subscription");
        } else {
          toast.error(`Push subscription failed: ${error.message}`);
        }
      }

      throw error;
    }
  };

  // Public subscribe function
  const subscribeToPush = async (): Promise<void> => {
    if (!swRegistrationRef.current) {
      console.error("❌ Service worker not registered");
      toast.error("Service worker is not ready. Please refresh the page and try again.");
      return;
    }
    await subscribeToPushInternal(swRegistrationRef.current);
  };

  // Send subscription to your backend with better error handling
  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const subData = subscription.toJSON();
      console.log("📤 Sending subscription to server:", {
        endpoint: subData.endpoint,
        userId,
        hasKeys: !!subData.keys,
        keysP256dh: subData.keys?.p256dh ? `${subData.keys.p256dh.substring(0, 20)}...` : 'Missing',
        keysAuth: subData.keys?.auth ? `${subData.keys.auth.substring(0, 20)}...` : 'Missing'
      });

      if (!subData.endpoint || !subData.keys?.p256dh || !subData.keys?.auth) {
        throw new Error("Subscription data is incomplete");
      }

      // Structure matches PushSubscriptionDto
      const payload = {
        userId,
        subscription: {
          endpoint: subData.endpoint,
          keys: {
            p256dh: subData.keys.p256dh,
            auth: subData.keys.auth,
          },
        },
      };

      await dataServices.api.notifications
        .subscribe()
        .post.call({ json: payload });

      console.log("✅ Subscription sent to server successfully");
    } catch (error) {
      console.error("❌ Error sending subscription to server:", error);

      if (error instanceof Error) {
        toast.error(`Failed to save subscription: ${error.message}`);
      } else {
        toast.error("Failed to save push subscription to server");
      }

      throw error;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async (): Promise<void> => {
    if (!swRegistrationRef.current) return;

    try {
      const subscription = await swRegistrationRef.current.pushManager.getSubscription();

      if (subscription) {
        console.log("🗑️ Unsubscribing from push notifications...");
        await subscription.unsubscribe();

        // Notify server about unsubscription
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            endpoint: subscription.endpoint,
          }),
        });

        setIsPushGranted(false);
        toast.success("Push notifications disabled");
        console.log("✅ Unsubscribed from push notifications");
      }
    } catch (error) {
      console.error("❌ Error unsubscribing from push:", error);
      toast.error("Failed to disable push notifications");
    }
  };

  const markAsRead = (id: string): void => {
    console.log("📖 Marking notification as read:", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <PusherContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        isPushSupported,
        isPushGranted,
        requestPushPermission,
        subscribeToPush,
        unsubscribeFromPush,
      }}
    >
      {children}
    </PusherContext.Provider>
  );
};

export const usePusher = () => {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error("usePusher must be used within a PusherProvider");
  }
  return context;
};
