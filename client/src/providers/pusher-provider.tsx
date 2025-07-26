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

      setIsPushSupported(supported);
      setIsPushGranted(Notification.permission === "granted");
    };

    checkPushSupport();
  }, []);

  useEffect(() => {
    const setupServiceWorker = async () => {
      if (!isPushSupported) return;

      try {
        // Register service worker from public directory
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Wait for it to be ready
        const readyRegistration = await navigator.serviceWorker.ready;
        swRegistrationRef.current = readyRegistration;

        console.log("Service Worker registered successfully:", readyRegistration);

        navigator.serviceWorker.addEventListener("message", handleSWMessage);

        if (Notification.permission === "granted") {
          await subscribeToPushInternal(readyRegistration);
        }
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    setupServiceWorker();

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    };
  }, [isPushSupported, userId]);

  // Handle messages from service worker
  const handleSWMessage = (event: MessageEvent) => {
    if (event.data.type === "NOTIFICATION_CLICKED") {
      const notificationData = event.data.data;
      console.log("Notification clicked in app:", notificationData);

      // Mark as read if ID exists
      if (notificationData.id) {
        markAsRead(notificationData.id);
      }
    }
  };

  // Set up Pusher connection
  useEffect(() => {
    if (pusherRef.current) {
      pusherRef.current.disconnect();
    }

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      forceTLS: true,
    });
    pusherRef.current = pusher;

    pusher.connection.bind(
      "state_change",
      (states: { previous: string; current: string }) => {
        console.log(
          "Pusher state change:",
          states.previous,
          "->",
          states.current
        );
      }
    );

    const channel = pusher.subscribe(`user-${userId}`);

    channel.bind("new-notification", async (data: PushNotification) => {
      console.log("Pusher data", data);

      // Since backend sends web push notifications separately,
      // only show toast when app is visible and push is not enabled
      if (!isPushGranted && document.visibilityState === "visible") {
        toast.success(data.message);
      }

      // Update app state regardless
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user-${userId}`);
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, [userId, isPushGranted]);

  // Convert VAPID key from base64
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Request push notification permission
  const requestPushPermission = async (): Promise<boolean> => {
    if (!isPushSupported) {
      console.log("Push notifications not supported");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      setIsPushGranted(granted);

      if (granted && swRegistrationRef.current) {
        await subscribeToPushInternal(swRegistrationRef.current);
      }

      return granted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  // Internal subscribe function
  const subscribeToPushInternal = async (
    registration: ServiceWorkerRegistration
  ) => {
    try {
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        console.log("Push subscription already exists");
        // Send existing subscription to server
        await sendSubscriptionToServer(existingSubscription);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log("Push subscription created:", subscription);
      await sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error("Error subscribing to push:", error);
    }
  };

  // Public subscribe function
  const subscribeToPush = async (): Promise<void> => {
    if (!swRegistrationRef.current) {
      console.error("Service worker not registered");
      return;
    }
    await subscribeToPushInternal(swRegistrationRef.current);
  };

  // Send subscription to your backend
  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const subData = subscription.toJSON();

      // Structure matches PushSubscriptionDto
      const payload: PushSubscriptionDto = {
        userId,
        subscription: {
          endpoint: subData.endpoint ?? "https://medic.devalentine.me",
          keys: {
            p256dh: subData.keys!.p256dh,
            auth: subData.keys!.auth,
          },
        },
      };

      await dataServices.api.notifications
        .subscribe()
        .post.call({ json: payload });

      console.log("Subscription sent to server successfully");
    } catch (error) {
      console.error("Error sending subscription to server:", error);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async (): Promise<void> => {
    if (!swRegistrationRef.current) return;

    try {
      const subscription =
        await swRegistrationRef.current.pushManager.getSubscription();

      if (subscription) {
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

        console.log("Unsubscribed from push notifications");
      }
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
    }
  };

  const markAsRead = (id: string): void => {
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
