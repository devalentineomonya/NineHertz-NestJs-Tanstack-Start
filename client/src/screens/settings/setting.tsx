import { useState, useEffect } from "react";
import { SettingsTab } from "./settings-tab";
import { NotificationsTab } from "./notification";
import { TwoFactorAuthTab } from "./two-factor-auth";
import { useGetAdmin } from "@/services/admin/use-get-admin";
import { useGetDoctor } from "@/services/doctors/use-get-doctor";
import { useUserSessionStore } from "@/stores/user-session-store";
import { useGetPatient } from "@/services/patients/use-get-patient";
import { useGetPharmacist } from "@/services/pharmacists/use-get-pharmacist";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PushNotificationSettings from "./push-notifications";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("Role");
  const { getCurrentUser } = useUserSessionStore();
  const [currentRole, setCurrentRole] = useState<
    "admin" | "patient" | "doctor" | "pharmacist" | undefined
  >(undefined);
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role;
  const userId = currentUser?.id;
  useEffect(() => {
    setCurrentRole(userRole);
  }, [userRole]);

  // Conditionally enable queries based on user role
  const adminQuery = useGetAdmin(userId, currentRole === userRole);
  const patientQuery = useGetPatient(userId, currentRole === userRole);
  const doctorQuery = useGetDoctor(userId, currentRole === userRole);
  const pharmacistQuery = useGetPharmacist(userId, currentRole === userRole);

  const getRoleData = () => {
    switch (userRole) {
      case "admin":
        return adminQuery.data;
      case "patient":
        return patientQuery.data;
      case "doctor":
        return doctorQuery.data;
      case "pharmacist":
        return pharmacistQuery.data;
      default:
        return null;
    }
  };

  const RoleData = getRoleData();
  const isLoading =
    (userRole === "admin" && adminQuery.isLoading) ||
    (userRole === "patient" && patientQuery.isLoading) ||
    (userRole === "doctor" && doctorQuery.isLoading) ||
    (userRole === "pharmacist" && pharmacistQuery.isLoading);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-white shadow-sm">
          <TabsTrigger value="Role">Role</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="push-notifications">Push Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Role Tab */}
        <TabsContent value="Role">
          <SettingsTab />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="push-notifications">
          <PushNotificationSettings />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <TwoFactorAuthTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
