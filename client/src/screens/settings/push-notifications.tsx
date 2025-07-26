import React, { useState } from "react";
import { usePusher } from "@/providers/pusher-provider";
import { Bell, BellOff, Settings, Check, X } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { useUserSessionStore } from "@/stores/user-session-store";
import { dataServices } from "@/services/data/data-service";
import { Button } from "@/components/ui/button";

const PushNotificationSettings = () => {
  const {
    isPushSupported,
    isPushGranted,
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,
  } = usePusher();
  const { getCurrentUser } = useUserSessionStore();
  const user = getCurrentUser();

  const [isLoading, setIsLoading] = useState(false);
  const [showTestButton, setShowTestButton] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleEnablePush = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPushPermission();
      if (granted) {
        await subscribeToPush();
        setShowTestButton(true);
      }
    } catch (error) {
      console.error("Error enabling push notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisablePush = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPush();
      setShowTestButton(false);
    } catch (error) {
      console.error("Error disabling push notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      // Call the correct test endpoint that sends both Pusher AND web push
      await dataServices.api.notifications.test().post.call({
        json: {
          userId: user?.id || "",
          title: "Test Push Notification",
          message:
            "This is a test push notification! You should see this as a Chrome notification.",
          url: window.location.origin + "/notifications",
        },
      });

      console.log("Test notification sent (both Pusher and Web Push)");
    } catch (error) {
      console.error("Error sending test notification:", error);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isPushSupported) {
    return (
      <TabsContent value="push-notifications" className="mt-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <BellOff className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              Push notifications are not supported in this browser
            </span>
          </div>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="push-notifications" className="mt-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Push Notifications
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Enable push notifications to receive alerts even when the app is
            closed
          </p>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isPushGranted ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Enabled</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-500">
                  <X className="w-5 h-5" />
                  <span className="font-medium">Disabled</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              {!isPushGranted ? (
                <Button
                  onClick={handleEnablePush}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span>{isLoading ? "Enabling..." : "Enable"}</span>
                </Button>
              ) : (
                <>
                  <Button
                    disabled={isTesting}
                    onClick={handleTestNotification}
                    className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    {isTesting ? "Testing..." : "Test Push"}
                  </Button>
                  <Button
                    onClick={handleDisablePush}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <BellOff className="w-4 h-4" />
                    <span>{isLoading ? "Disabling..." : "Disable"}</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {isPushGranted && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-green-800 font-medium">
                    Push notifications are active
                  </p>
                  <p className="text-green-700 mt-1">
                    You'll receive notifications even when the app is closed or
                    in the background. Click "Test Push" to see a real push
                    notification.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              • Notifications will appear on your device even when the browser
              is closed
            </p>
            <p>
              • You can manage notification permissions in your browser settings
            </p>
            <p>• Different devices may require separate permission grants</p>
            <p>• Test notifications are sent as actual push notifications</p>
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

export default PushNotificationSettings;
