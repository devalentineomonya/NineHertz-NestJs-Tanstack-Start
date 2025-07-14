import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsTab } from "./settings-tab";
import { NotificationsTab } from "./notification";
import { TwoFactorAuthTab } from "./two-factor-auth";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-white shadow-sm">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <SettingsTab />
        <NotificationsTab />
        <TwoFactorAuthTab />
      </Tabs>
    </div>
  );
};
