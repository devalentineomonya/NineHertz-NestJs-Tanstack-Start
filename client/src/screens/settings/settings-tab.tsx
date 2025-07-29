import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUserSessionStore } from "@/stores/user-session-store";

// Zod schemas
const personalDetailsSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  clinicName: z.string().optional(),
  location: z.string().min(1, "Please select a location"),
  currency: z.string().min(1, "Please select a currency"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
  appointmentFee: z.number().optional(),
  profilePicture: z.string().optional(),
});

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;
type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

interface SettingsTabProps {
  currentUser?: any;
  roleData?: any;
  isLoading?: boolean;
  onSave?: (data: PersonalDetailsFormData) => void;
  onPasswordChange?: (data: PasswordChangeFormData) => void;
}

export const SettingsTab = ({
  currentUser,
  roleData,
  isLoading = false,
  onSave,
  onPasswordChange,
}: SettingsTabProps) => {
  const [profileImage, setProfileImage] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const { getCurrentUser } = useUserSessionStore();

  // If props not provided, get from store
  const user = currentUser || getCurrentUser();
  const hasProfile = user?.hasProfile;

  // Personal details form
  const personalForm = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      fullName: "",
      clinicName: "",
      location: "",
      currency: "",
      email: "",
      phone: "",
      address: "",
      licenseNumber: "",
      specialty: "",
      appointmentFee: 0,
    },
  });

  // Password change form
  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Set initial values when user data is available
  useEffect(() => {
    if (user && hasProfile && roleData) {
      // Set profile image
      setProfileImage(user.profilePicture || "/assets/doctor-avatar.jpg");

      // Populate form based on user role and data
      const formData: Partial<PersonalDetailsFormData> = {
        fullName: roleData.fullName || "",
        email: user.email || "",
        phone: roleData.phone || "",
        address: roleData.address || "",
        location: roleData.location || "india",
        currency: roleData.currency || "inr",
      };

      // Role-specific fields
      if (user.role === "doctor" || user.role === "admin") {
        formData.clinicName = roleData.clinicName || "";
        formData.licenseNumber = roleData.licenseNumber || "";
        formData.specialty = roleData.specialty || "";
        formData.appointmentFee = roleData.appointmentFee || 0;
      }

      personalForm.reset(formData);
    } else if (user && !hasProfile) {
      // New user without profile - set basic info
      personalForm.reset({
        fullName: "",
        email: user.email || "",
        phone: "",
        address: "",
        location: "india",
        currency: "inr",
        clinicName: "",
        licenseNumber: "",
        specialty: "",
        appointmentFee: 0,
      });
      setProfileImage("/assets/doctor-avatar.jpg");
    }
  }, [user, hasProfile, roleData, personalForm]);

  // File upload to Supabase
  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast("Failed to upload image. Please try again.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (800KB max)
    if (file.size > 800 * 1024) {
      toast("Please select an image smaller than 800KB.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast("Please select a valid image file.");
      return;
    }

    // Upload to Supabase
    const uploadedUrl = await uploadImageToSupabase(file);
    if (uploadedUrl) {
      setProfileImage(uploadedUrl);
      toast("Profile picture updated successfully.");
    }
  };

  const handleResetImage = () => {
    setProfileImage("/assets/doctor-avatar.jpg");
  };

  const onPersonalDetailsSubmit = (data: PersonalDetailsFormData) => {
    if (onSave) {
      onSave({ ...data, profilePicture: profileImage });
    } else {
      console.log("Profile saved:", { ...data, profilePicture: profileImage });
      toast("Your profile has been updated successfully.");
    }
  };

  const onPasswordSubmit = (data: PasswordChangeFormData) => {
    if (onPasswordChange) {
      onPasswordChange(data);
    } else {
      console.log("Password change requested");
      toast("Your password has been updated successfully.");
    }
    passwordForm.reset();
  };

  const getUserInitials = () => {
    if (hasProfile && roleData?.fullName) {
      return roleData.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (hasProfile && roleData?.fullName) {
      return roleData.fullName;
    }
    return user?.email || "User";
  };

  if (isLoading) {
    return (
      <TabsContent value="profile" className="mt-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </TabsContent>
    );
  }

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
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-medium">{getUserDisplayName()}</p>
                <p className="text-sm text-gray-500">
                  {user?.role?.toUpperCase()}
                </p>
                {!hasProfile && (
                  <p className="text-xs text-orange-600 mt-1">
                    Complete your profile to get started
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={uploadingImage}
                >
                  <Label htmlFor="profile-upload" className="cursor-pointer">
                    {uploadingImage ? "Uploading..." : "Upload"}
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </Label>
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleResetImage}
                  disabled={uploadingImage}
                >
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
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Update Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Personal Details Card - Full width */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Personal Details
            </CardTitle>
            <p className="text-sm text-gray-600">
              {hasProfile
                ? "To change your personal details, edit and save from here"
                : "Complete your profile by filling in your details below"}
            </p>
          </CardHeader>
          <CardContent>
            <Form {...personalForm}>
              <form
                onSubmit={personalForm.handleSubmit(onPersonalDetailsSubmit)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={personalForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(user?.role === "doctor" || user?.role === "admin") && (
                    <FormField
                      control={personalForm.control}
                      name="clinicName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={personalForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="inr">India (INR)</SelectItem>
                            <SelectItem value="usd">US Dollar (USD)</SelectItem>
                            <SelectItem value="eur">Euro (EUR)</SelectItem>
                            <SelectItem value="gbp">
                              British Pound (GBP)
                            </SelectItem>
                            <SelectItem value="aud">
                              Australian Dollar (AUD)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(user?.role === "doctor" || user?.role === "admin") && (
                    <>
                      <FormField
                        control={personalForm.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialty</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select specialty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cardiology">
                                  Cardiology
                                </SelectItem>
                                <SelectItem value="dermatology">
                                  Dermatology
                                </SelectItem>
                                <SelectItem value="endocrinology">
                                  Endocrinology
                                </SelectItem>
                                <SelectItem value="gastroenterology">
                                  Gastroenterology
                                </SelectItem>
                                <SelectItem value="neurology">
                                  Neurology
                                </SelectItem>
                                <SelectItem value="oncology">
                                  Oncology
                                </SelectItem>
                                <SelectItem value="orthopedics">
                                  Orthopedics
                                </SelectItem>
                                <SelectItem value="pediatrics">
                                  Pediatrics
                                </SelectItem>
                                <SelectItem value="psychiatry">
                                  Psychiatry
                                </SelectItem>
                                <SelectItem value="radiology">
                                  Radiology
                                </SelectItem>
                                <SelectItem value="urology">Urology</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="appointmentFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Appointment Fee</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={personalForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => personalForm.reset()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {hasProfile ? "Save Changes" : "Create Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};
