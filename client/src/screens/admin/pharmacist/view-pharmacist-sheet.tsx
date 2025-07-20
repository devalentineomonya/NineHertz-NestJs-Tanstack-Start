import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useViewPharmacistStore } from "@/stores/use-view-pharmacist-store";
import { format } from "date-fns";
import {
  BadgeCheck,
  Calendar,
  CheckCircle,
  Mail,
  Phone,
  Shield,
  XCircle,
  Pill,
  ClipboardList,
  Building,
  GraduationCap,
} from "lucide-react";

export const ViewPharmacistDrawer = () => {
  const {
    isOpen,
    onClose,
    pharmacist: selectedPharmacist,
    id: pharmacistId,
  } = useViewPharmacistStore();

  if (!selectedPharmacist) return null;

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="flex-row justify-between items-center border-b mt-2 pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="rounded-md h-12 w-12">
              <AvatarImage
                src={`https://avatar.vercel.sh/${
                  selectedPharmacist.user.email.split("@")[0]
                }?rounded=5`}
              />
              <AvatarFallback>
                {selectedPharmacist.user.email.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DrawerTitle className="font-extrabold text-xl capitalize flex items-center gap-2">
                {selectedPharmacist.fullName}
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </DrawerTitle>
              <p className="text-sm text-muted-foreground">
                Pharmacist • Licensed since{" "}
                {format(new Date(selectedPharmacist.createdAt), "MMM yyyy")}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            License: {selectedPharmacist.licenseNumber}
          </Badge>
        </DrawerHeader>

        <ScrollArea className="px-6 py-4 h-[calc(100dvh-172px)]">
          <div className="space-y-4">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <ClipboardList className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedPharmacist.fullName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    License Number
                  </p>
                  <p className="font-medium">
                    {selectedPharmacist.licenseNumber}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedPharmacist.status ? "success" : "destructive"
                    }
                    className="mt-1"
                  >
                    {selectedPharmacist.status ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Joined Date</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedPharmacist.createdAt),
                      "MMM d, yyyy"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 rounded-full p-2 mt-0.5">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {selectedPharmacist.user.email}
                    </p>
                    <Badge
                      variant={
                        selectedPharmacist.user.isEmailVerified
                          ? "success"
                          : "secondary"
                      }
                      className="mt-1"
                    >
                      <div className="flex items-center gap-1">
                        {selectedPharmacist.user.isEmailVerified ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {selectedPharmacist.user.isEmailVerified
                          ? "Verified"
                          : "Unverified"}
                      </div>
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-50 rounded-full p-2 mt-0.5">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {selectedPharmacist.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Shield className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant="secondary" className="capitalize mt-1">
                    <Shield className="size-4 mr-2" />
                    Pharmacist
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium text-sm font-mono">
                    {selectedPharmacist.user.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Pharmacist ID</p>
                  <p className="font-medium text-sm font-mono">
                    {pharmacistId}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedPharmacist.updatedAt),
                      "MMM d, yyyy"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DrawerFooter className="flex flex-row justify-end gap-3 border-t pt-4">
          <Button variant="outline">Edit Profile</Button>
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
