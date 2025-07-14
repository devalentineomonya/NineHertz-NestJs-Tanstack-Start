import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";

export const SettingsTab = () => {
  const [profileImage, setProfileImage] = useState<string>(
    "/assets/doctor-avatar.jpg"
  );

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [personalDetails, setPersonalDetails] = useState({
    name: "Dr. Mathew Anderson",
    clinicName: "MediCare Clinic",
    location: "india",
    currency: "inr",
    email: "mathew.anderson@medicare.example",
    phone: "+91 12345 65478",
    address: "814 Healthcare Street, Mumbai, 400001",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setProfileImage("/assets/doctor-avatar.jpg");
  };

  const handlePersonalDetailsChange = (field: string, value: string) => {
    setPersonalDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Profile saved:", personalDetails);
    // In a real app, you would make an API call here
  };
  return (
    <TabsContent value="profile" className="mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Profile Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Change Profile
            </CardTitle>
            <p className="text-sm text-gray-600">
              Change your profile picture from here
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-2">
              <Avatar className="w-24 h-24 border-2 border-blue-100">
                <AvatarImage src={profileImage} alt="Profile" />
                <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                  MA
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-3">
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Label htmlFor="profile-upload" className="cursor-pointer">
                    Upload
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </Label>
                </Button>
                <Button variant="destructive" onClick={handleResetImage}>
                  Reset
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Allowed JPG, GIF or PNG. Max size of 800K
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Change Password
            </CardTitle>
            <p className="text-sm text-gray-600">
              To change your password please confirm here
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details Card - Full width */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Personal Details
            </CardTitle>
            <p className="text-sm text-gray-600">
              To change your personal details, edit and save from here
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={personalDetails.name}
                  onChange={(e) =>
                    handlePersonalDetailsChange("name", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="clinic-name">Clinic Name</Label>
                <Input
                  id="clinic-name"
                  value={personalDetails.clinicName}
                  onChange={(e) =>
                    handlePersonalDetailsChange("clinicName", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  value={personalDetails.location}
                  onValueChange={(value) =>
                    handlePersonalDetailsChange("location", value)
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="usa">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={personalDetails.currency}
                  onValueChange={(value) =>
                    handlePersonalDetailsChange("currency", value)
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inr">India (INR)</SelectItem>
                    <SelectItem value="usd">US Dollar (USD)</SelectItem>
                    <SelectItem value="eur">Euro (EUR)</SelectItem>
                    <SelectItem value="gbp">British Pound (GBP)</SelectItem>
                    <SelectItem value="aud">Australian Dollar (AUD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalDetails.email}
                  onChange={(e) =>
                    handlePersonalDetailsChange("email", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={personalDetails.phone}
                  onChange={(e) =>
                    handlePersonalDetailsChange("phone", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={personalDetails.address}
                  onChange={(e) =>
                    handlePersonalDetailsChange("address", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <Button
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          Cancel
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </TabsContent>
  );
};
