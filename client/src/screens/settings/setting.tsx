import { useState, useEffect } from "react";
import { SettingsTab } from "./settings-tab";
import { NotificationsTab } from "./notification";
import { useUserSessionStore } from "@/stores/user-session-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PushNotificationSettings from "./push-notifications";
import { useGetAdminByUserId } from "@/services/admin/use-get-admin-by-user-id";
import { useGetPatientByUserId } from "@/services/patients/use-get-patient-by-user-id";
import { useGetDoctorByUserId } from "@/services/doctors/use-get-doctor-by-user-id";
import { useGetPharmacistByUserId } from "@/services/pharmacists/use-get-pharmacist-by-user-id";
import { toast } from "sonner";

type UserRole = "admin" | "patient" | "doctor" | "pharmacist";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { getCurrentUser } = useUserSessionStore();
  const [currentRole, setCurrentRole] = useState<UserRole | undefined>(
    undefined
  );

  const currentUser = getCurrentUser();
  const userRole = currentUser?.role as UserRole;
  const userId = currentUser?.id;

  useEffect(() => {
    setCurrentRole(userRole);
  }, [userRole]);

  // Only fetch data for the current user's role
  const adminQuery = useGetAdminByUserId(userId, currentRole === "admin");
  const patientQuery = useGetPatientByUserId(userId, currentRole === "patient");
  const doctorQuery = useGetDoctorByUserId(userId, currentRole === "doctor");
  const pharmacistQuery = useGetPharmacistByUserId(
    userId,
    currentRole === "pharmacist"
  );

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

  const roleData = getRoleData();
  const isLoading =
    (userRole === "admin" && adminQuery.isLoading) ||
    (userRole === "patient" && patientQuery.isLoading) ||
    (userRole === "doctor" && doctorQuery.isLoading) ||
    (userRole === "pharmacist" && pharmacistQuery.isLoading);

  const handleProfileSave = async (data: any) => {
    try {
      // Here you would implement the API call to save profile data
      // Example:
      // const response = await updateUserProfile(userId, data);

      console.log("Saving profile data:", data);

      // Show success message
      toast("Your profile has been updated successfully.");

      // Refetch the data to get updated values
      switch (userRole) {
        case "admin":
          adminQuery.refetch();
          break;
        case "patient":
          patientQuery.refetch();
          break;
        case "doctor":
          doctorQuery.refetch();
          break;
        case "pharmacist":
          pharmacistQuery.refetch();
          break;
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordChange = async (data: any) => {
    try {
      // Here you would implement the API call to change password
      // Example:
      // const response = await changeUserPassword(userId, data);

      console.log("Changing password for user:", userId);

      // Show success message
      toast("Your password has been updated successfully.");
    } catch (error) {
      console.error("Error changing password:", error);
      toast("Failed to change password. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-white shadow-sm">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="push-notifications">
            Push Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <SettingsTab
            currentUser={currentUser}
            roleData={roleData}
            isLoading={isLoading}
            onSave={handleProfileSave}
            onPasswordChange={handlePasswordChange}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="push-notifications">
          <PushNotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
