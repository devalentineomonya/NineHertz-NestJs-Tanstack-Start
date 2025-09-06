import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, X } from "lucide-react";
import { useState } from "react";
import { usePusher } from "@/providers/pusher-provider";
import { PushNotification } from "@/screens/notifications/notifications-page";
import { Link } from "@tanstack/react-router";
import { useMarkAllAsRead } from "@/services/notifications/mark-all-as-read";
import { useGetNotifications } from "@/services/notifications/use-get-notifications";
import { useUserSessionStore } from "@/stores/user-session-store";

export default function NotificationDropdown() {
  const markAllAsReadHandler = useMarkAllAsRead();
  const { data, isLoading: loadingNotifications } = useGetNotifications();
  const { getCurrentUser } = useUserSessionStore();
  const user = getCurrentUser();
  const pusherContext = usePusher();
  const { notifications, unreadCount, markAsRead } = pusherContext || {
    notifications: [],
    unreadCount: 0,
    markAsRead: () => {},
  };

  const [isLoading, setIsLoading] = useState(true);

  const typeColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-600 dark:bg-red-900/40",
    warning: "bg-orange-100 text-orange-600 dark:bg-orange-900/40",
    info: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40",
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadHandler.mutateAsync();

      // Update all as read locally
      notifications.forEach((n) => markAsRead(n.id));
    } catch (error) {
      console.error("Error marking all as read", error);
    }
  };

  const getNotificationContent = (notification: PushNotification) => {
    if (notification.data?.appointmentId) {
      return {
        title: "Appointment Update",
        description:
          notification.message || "Your appointment status has changed",
      };
    }
    return {
      title: "System Notification",
      description: notification.message,
    };
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[360px] p-0 rounded-md shadow-lg bg-background text-foreground"
      >
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-primary text-sm h-8"
              >
                Mark all read
              </Button>
            )}
            <Badge className="bg-primary text-white px-2.5 py-1 rounded-sm">
              {unreadCount} new
            </Badge>
          </div>
        </div>

        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mb-2" />
              <h4 className="text-lg font-medium">No notifications</h4>
              <p className="text-sm text-muted-foreground">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => {
                const content = getNotificationContent(n);
                return (
                  <li
                    key={n.id}
                    className={`px-4 py-3 flex justify-between items-start hover:bg-muted/50 transition-colors cursor-pointer ${
                      !n.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div
                        className={`h-10 w-10 flex items-center justify-center rounded-full ${
                          typeColors[n.type] || typeColors.info
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between">
                          <h5 className="text-sm font-semibold">
                            {content.title}
                          </h5>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(n.id);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {content.description}
                        </p>
                        {n.data?.appointmentId && (
                          <div className="mt-2">
                            <Badge variant="outline">
                              Appointment ID: {n.data.appointmentId.slice(0, 8)}
                            </Badge>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground mt-2">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>

        <div className="px-4 py-2 border-t">
          <Button variant="outline" className="w-full text-sm">
            <Link to={`/${user?.role || "patient"}/notification`}>
              View All Notifications
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
