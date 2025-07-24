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

Pusher.logToConsole = true; // Enable Pusher debug logs early


interface PusherContextType {
  notifications: PushNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
}

const PusherContext = createContext<PusherContextType | null>(null);

export const PusherProvider = ({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    // Disconnect previous instance if any
    if (pusherRef.current) {
      pusherRef.current.disconnect();
    }

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      forceTLS: true,
    });
    pusherRef.current = pusher;

    // Log state changes for debugging
    pusher.connection.bind("state_change", (states: { previous: string; current: string }) => {
      console.log(
        "Pusher state change:",
        states.previous,
        "->",
        states.current
      );
    });

    const channel = pusher.subscribe(`user-${userId}`);

    channel.bind("new-notification", (data: PushNotification) => {
      console.log("Pusher data", data);
      toast.success(data.message);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user-${userId}`);
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, [userId]);

  const markAsRead = (id: string): void => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <PusherContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </PusherContext.Provider>
  );
};

export const usePusher = () => useContext(PusherContext);
