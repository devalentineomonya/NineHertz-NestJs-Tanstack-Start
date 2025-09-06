import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  Mail,
  MessageSquare,
  Calendar,
  Pill,
  Newspaper,
  AlertTriangle,
} from "lucide-react";

// Zod validation schema
const notificationSettingsSchema = z
  .object({
    emailEnabled: z.boolean(),
    whatsappEnabled: z.boolean(),
    emailAddress: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    whatsappNumber: z.string().optional(),
    appointmentReminders: z.boolean(),
    medicationOrders: z.boolean(),
    healthNewsletters: z.boolean(),
    criticalAlerts: z.boolean(),
  })
  .refine(
    (data) => {
      // If email is enabled, email address is required
      if (
        data.emailEnabled &&
        (!data.emailAddress || data.emailAddress === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Email address is required when email notifications are enabled",
      path: ["emailAddress"],
    }
  )
  .refine(
    (data) => {
      // If WhatsApp is enabled, phone number is required
      if (
        data.whatsappEnabled &&
        (!data.whatsappNumber || data.whatsappNumber === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "WhatsApp number is required when WhatsApp notifications are enabled",
      path: ["whatsappNumber"],
    }
  );

type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

interface NotificationsTabProps {
  initialData?: Partial<NotificationSettingsFormData>;
  onSave?: (data: NotificationSettingsFormData) => void;
  isLoading?: boolean;
}

export const NotificationsTab = ({
  initialData,
  onSave,
  isLoading = false,
}: NotificationsTabProps) => {
  const form = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailEnabled: true,
      whatsappEnabled: false,
      emailAddress: "",
      whatsappNumber: "",
      appointmentReminders: true,
      medicationOrders: true,
      healthNewsletters: false,
      criticalAlerts: true,
      ...initialData,
    },
  });

  const { watch } = form;
  const emailEnabled = watch("emailEnabled");
  const whatsappEnabled = watch("whatsappEnabled");

  const onSubmit = (data: NotificationSettingsFormData) => {
    if (onSave) {
      onSave(data);
    } else {
      console.log("Notification settings saved:", data);
      toast("Your notification preferences have been updated successfully.");
    }
  };

  const handleCancel = () => {
    form.reset();
    toast("Your notification settings have been reset.");
  };

  return (
    <TabsContent value="notifications" className="mt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Notification Preferences</CardTitle>
              <CardDescription>
                Select how you'd like to receive healthcare notifications.
                Service messages (appointment confirmations, emergency alerts,
                etc.) cannot be disabled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Communication Channels */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Communication Channels
                </h3>

                {/* Email Notifications */}
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="emailEnabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* WhatsApp Notifications */}
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
                  <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">WhatsApp Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via WhatsApp
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="whatsappEnabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>

                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address {emailEnabled && "*"}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="patient@example.com"
                          disabled={!emailEnabled}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {emailEnabled
                          ? "Required for email notifications"
                          : "Enable email notifications to set an email address"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        WhatsApp Number {whatsappEnabled && "*"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          disabled={!whatsappEnabled}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {whatsappEnabled
                          ? "Required for WhatsApp notifications"
                          : "Enable WhatsApp notifications to set a phone number"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notification Types */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Types</h3>

                {/* Appointment Reminders */}
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Appointment Reminders</h4>
                    <p className="text-sm text-muted-foreground">
                      Notifications for upcoming consultations
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="appointmentReminders"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Medication Orders */}
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
                  <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Medication Orders</h4>
                    <p className="text-sm text-muted-foreground">
                      Notifications for prescription status and refills
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="medicationOrders"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Health Newsletters */}
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg">
                  <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Health Newsletters</h4>
                    <p className="text-sm text-muted-foreground">
                      Health tips, research updates, and facility news
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="healthNewsletters"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Critical Health Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border rounded-lg bg-red-50">
                  <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800">
                      Critical Health Alerts
                    </h4>
                    <p className="text-sm text-red-600">
                      Urgent notifications about test results or recalls (Always
                      enabled)
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="criticalAlerts"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={true} // Critical alerts cannot be disabled
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Notification Schedule */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Notification Schedule</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Notifications will be sent during these times:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Appointment reminders: 24 hours and 1 hour before</li>
                  <li>• Medication orders: Immediately when status changes</li>
                  <li>• Health newsletters: Weekly on Sundays</li>
                  <li>• Critical alerts: Immediately, any time</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </TabsContent>
  );
};
