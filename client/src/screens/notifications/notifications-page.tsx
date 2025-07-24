import { useState, useEffect } from "react";
import axios from "axios";
import { useUserSessionStore } from "@/stores/user-session-store";
import { Button } from "@/components/ui/button";
import { Bell, Check, X, Trash2, ChevronLeft } from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@tanstack/react-router";
import { useGetNotifications } from "@/services/notifications/use-get-notifications";
import { useMarkAsRead } from "@/services/notifications/use-mark-as-read";
import { useMarkAllAsRead } from "@/services/notifications/mark-all-as-read";
export interface PushNotification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: "info" | "warning" | "urgent";
  data?: {
    appointmentId?: string;
    doctorName?: string;
    prescriptionId?: string;
  };
}

const groupNotifications = (notifications: PushNotification[]) => {
  const groups: Record<string, PushNotification[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    Earlier: [],
  };

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    if (isToday(date)) {
      groups.Today.push(notification);
    } else if (isYesterday(date)) {
      groups.Yesterday.push(notification);
    } else if (Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      groups["Last 7 Days"].push(notification);
    } else {
      groups.Earlier.push(notification);
    }
  });

  return Object.entries(groups).filter(([_, items]) => items.length > 0);
};

export default function NotificationsPage() {
  const router = useRouter();
  const user = useUserSessionStore().getCurrentUser();
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const { data, isLoading: loadingNotifications } = useGetNotifications();
  const markAsReadHandler = useMarkAsRead();
  const markAllAsReadHandler = useMarkAllAsRead();

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        if (data?.data) {
          const mappedNotifications = data.data.map((notification: Notification) => ({
            ...notification,
            type: "info",
          })) as PushNotification[];
          setNotifications(mappedNotifications);
        }
        setUnreadCount(data?.data ? data.data.filter((n: Notification) => !n.read).length : 0);
      } catch (error) {
        console.error("Error fetching notifications", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id, notifications, loadingNotifications]);

  // Setup Pusher real-time updates
  useEffect(() => {
    if (!user?.id) return;

    // @ts-ignore
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`user-${user.id}`);

    channel.bind("new-notification", (newNotification: PushNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}   `);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadHandler.mutateAsync();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/notifications/${id}`
      );

      setNotifications((prev) => prev.filter((n) => n.id !== id));

      // Update unread count if notification was unread
      const deletedNotif = notifications.find((n) => n.id === id);
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(
        selectedNotifications.map((id) =>
          axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/notifications/${id}`
          )
        )
      );

      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.includes(n.id))
      );

      // Update unread count
      const deletedUnread = notifications.filter(
        (n) => selectedNotifications.includes(n.id) && !n.read
      ).length;

      setUnreadCount((prev) => Math.max(0, prev - deletedUnread));
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error deleting selected notifications", error);
    }
  };

  const markSelectedAsRead = async () => {
    try {
      await Promise.all(
        selectedNotifications.map((id) => markAsReadHandler.mutateAsync(id))
      );

      setNotifications((prev) =>
        prev.map((n) =>
          selectedNotifications.includes(n.id) ? { ...n, read: true } : n
        )
      );

      const unreadSelected = notifications.filter(
        (n) => selectedNotifications.includes(n.id) && !n.read
      ).length;

      setUnreadCount((prev) => Math.max(0, prev - unreadSelected));
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error marking selected as read", error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNotificationClick = (notification: PushNotification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (notification.data?.appointmentId) {
      router.navigate({
        to: `${user?.role}/appointments`,
      });
    } else if (notification.data?.prescriptionId) {
      router.navigate({
        to: `${user?.role}/prescription`,
      });
    }
    // Add other navigation cases as needed
  };

  const groupedNotifications = groupNotifications(notifications);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center max-md:flex-col max-md:gap-y-4 justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.navigate({ to: `${user?.role}/dashboard` })}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="px-2.5 py-1 bg-primary text-white">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedNotifications.length > 0 ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={markSelectedAsRead}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Mark as read
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark all as read
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setSelectedNotifications(notifications.map((n) => n.id))
                    }
                  >
                    Select all
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-4 border rounded-lg flex items-start gap-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-medium mb-2">No notifications yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            We'll notify you about important events like appointment
            confirmations, prescription updates, and account activities.
          </p>
          <Link to={`/${user?.role || "patient"}/dashboard`}>
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedNotifications.map(([groupName, groupNotifications]) => (
            <div key={groupName} className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground border-b pb-2">
                {groupName}
              </h2>

              <div className="space-y-3">
                {groupNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border flex items-start gap-4 transition-colors ${
                      selectedNotifications.includes(notification.id)
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : !notification.read
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center mt-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(
                          notification.id
                        )}
                        onChange={() => toggleSelect(notification.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`h-8 w-8 flex items-center justify-center rounded-full ${
                              notification.type === "urgent"
                                ? "bg-red-100 text-red-600 dark:bg-red-900/40"
                                : notification.type === "warning"
                                ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40"
                                : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40"
                            }`}
                          >
                            <Bell className="h-4 w-4" />
                          </div>
                          <h3 className="font-medium">
                            {notification.data?.appointmentId
                              ? "Appointment Update"
                              : notification.data?.prescriptionId
                              ? "Prescription Update"
                              : "System Notification"}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary"></span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(notification.createdAt)
                            )}{" "}
                            ago
                          </span>
                        </div>
                      </div>

                      <p className="text-sm mt-2">{notification.message}</p>

                      {notification.data && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {notification.data.appointmentId && (
                            <Badge variant="secondary">
                              Appointment:{" "}
                              {notification.data.appointmentId.slice(0, 8)}
                            </Badge>
                          )}
                          {notification.data.prescriptionId && (
                            <Badge variant="secondary">
                              Prescription:{" "}
                              {notification.data.prescriptionId.slice(0, 8)}
                            </Badge>
                          )}
                          {notification.data.doctorName && (
                            <Badge variant="secondary">
                              Dr. {notification.data.doctorName}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
