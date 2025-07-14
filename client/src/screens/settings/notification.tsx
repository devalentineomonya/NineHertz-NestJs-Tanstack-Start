import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

export const NotificationsTab = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    whatsappEnabled: false,
    emailAddress: "",
    whatsappNumber: "",
    appointmentReminders: true,
    medicationOrders: true,
    healthNewsletters: false,
    criticalAlerts: true,
  });

  const handleChange = (field: string, value: any) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    console.log("Notification settings saved:", notificationSettings);
  };

  return (
    <TabsContent value="notifications" className="mt-6">
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Healthcare Notification Preferences</CardTitle>
            <CardDescription>
              Select how you'd like to receive healthcare notifications. Service
              messages (appointment confirmations, emergency alerts, etc.)
              cannot be disabled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Communication Channels */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
              <div className="bg-gray-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-mail"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <polyline points="3 7 12 13 21 7"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Email Notifications</h3>
              </div>
              <Switch
                checked={notificationSettings.emailEnabled}
                onCheckedChange={(checked) =>
                  handleChange("emailEnabled", checked)
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
              <div className="bg-gray-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-brand-whatsapp"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"></path>
                  <path d="M9 10a0.5 .5 0 0 0 1 0v-1a0.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 .5 0 0 0 0 -1h-1a0.5 .5 0 0 0 0 1"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">WhatsApp Notifications</h3>
              </div>
              <Switch
                checked={notificationSettings.whatsappEnabled}
                onCheckedChange={(checked) =>
                  handleChange("whatsappEnabled", checked)
                }
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address*</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="patient@example.com"
                  value={notificationSettings.emailAddress}
                  onChange={(e) => handleChange("emailAddress", e.target.value)}
                  required={notificationSettings.emailEnabled}
                  disabled={!notificationSettings.emailEnabled}
                />
                <p className="text-sm text-muted-foreground">
                  Required for email notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+1234567890"
                  value={notificationSettings.whatsappNumber}
                  onChange={(e) =>
                    handleChange("whatsappNumber", e.target.value)
                  }
                  required={notificationSettings.whatsappEnabled}
                  disabled={!notificationSettings.whatsappEnabled}
                />
                <p className="text-sm text-muted-foreground">
                  Required for WhatsApp notifications
                </p>
              </div>
            </div>

            {/* Notification Types */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-calendar-event"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <rect x="4" y="5" width="16" height="16" rx="2"></rect>
                    <line x1="16" y1="3" x2="16" y2="7"></line>
                    <line x1="8" y1="3" x2="8" y2="7"></line>
                    <line x1="4" y1="11" x2="20" y2="11"></line>
                    <rect x="8" y="15" width="2" height="2"></rect>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Appointment Reminders</h3>
                  <p className="text-sm text-muted-foreground">
                    Notifications for upcoming consultations
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.appointmentReminders}
                  onCheckedChange={(checked) =>
                    handleChange("appointmentReminders", checked)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-pill"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4.5 12.5l8 -8a4.94 4.94 0 0 1 7 7l-8 8a4.94 4.94 0 0 1 -7 -7"></path>
                    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5"></line>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Medication Orders</h3>
                  <p className="text-sm text-muted-foreground">
                    Notifications for prescription status and refills
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.medicationOrders}
                  onCheckedChange={(checked) =>
                    handleChange("medicationOrders", checked)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-news"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11"></path>
                    <line x1="8" y1="8" x2="12" y2="8"></line>
                    <line x1="8" y1="12" x2="12" y2="12"></line>
                    <line x1="8" y1="16" x2="12" y2="16"></line>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Health Newsletters</h3>
                  <p className="text-sm text-muted-foreground">
                    Health tips, research updates, and facility news
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.healthNewsletters}
                  onCheckedChange={(checked) =>
                    handleChange("healthNewsletters", checked)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
                <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-alert-triangle"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M12 9v2m0 4v.01"></path>
                    <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Critical Health Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Urgent notifications about test results or recalls
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.criticalAlerts}
                  onCheckedChange={(checked) =>
                    handleChange("criticalAlerts", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button type="submit" className="bg-primary hover:bg-primary-dark">
            Save Preferences
          </Button>
          <Button type="button" variant="outline" className="border-gray-300">
            Cancel
          </Button>
        </div>
      </form>
    </TabsContent>
  );
};
