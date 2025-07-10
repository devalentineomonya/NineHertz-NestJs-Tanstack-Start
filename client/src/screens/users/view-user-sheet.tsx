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
import { useViewPatient } from "@/stores/use-view-patient-store";
import { useViewUser } from "@/stores/use-view-user-store";
import { format } from "date-fns";
import {
  BadgeCheck,
  Calendar,
  CheckCircle,
  Mail,
  Phone,
  Shield,
  XCircle,
} from "lucide-react";

export const ViewUserSheet = () => {
  const {
    isOpen: isUserDrawerOpen,
    onClose: closeUserDrawer,
    user: selectedUser,
    id: userId,
  } = useViewUser();
  const { onOpen: openPatientDrawer } = useViewPatient();

  if (!selectedUser) return null;

  return (
    <Drawer
      direction="right"
      open={isUserDrawerOpen}
      onOpenChange={closeUserDrawer}
    >
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="flex-row justify-between items-center border-b mt-2 pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="rounded-md h-12 w-12">
              <AvatarImage
                src={`https://avatar.vercel.sh/${
                  selectedUser.email.split("@")[0]
                }?rounded=5`}
              />
              <AvatarFallback>
                {selectedUser.email.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DrawerTitle className="font-extrabold text-xl capitalize flex items-center gap-2">
                {selectedUser.profile?.fullName ||
                  selectedUser.email.split("@")[0]}
                {selectedUser.isEmailVerified && (
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                )}
              </DrawerTitle>
              <p className="text-sm text-muted-foreground">
                {selectedUser.role} • Joined{" "}
                {format(new Date(selectedUser.createdAt), "MMM yyyy")}
              </p>
            </div>
          </div>
          {selectedUser.profile && (
            <Button
              variant="primary"
              className="w-fit"
              onClick={() =>
                openPatientDrawer(selectedUser.profile?.id || null, null)
              }
            >
              View {selectedUser.role} Profile
            </Button>
          )}
        </DrawerHeader>

        <ScrollArea className="px-6 py-4 h-[calc(100dvh-172px)]">
          <div className="space-y-4">
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
                    <p className="font-medium">{selectedUser.email}</p>
                    <Badge
                      variant={
                        selectedUser.isEmailVerified ? "success" : "secondary"
                      }
                      className="mt-1"
                    >
                      <div className="flex items-center gap-1">
                        {selectedUser.isEmailVerified ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {selectedUser.isEmailVerified
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
                      {selectedUser.profile?.phone || "Not provided"}
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
                  <Badge
                    variant={
                      selectedUser.role === "admin"
                        ? "destructive"
                        : selectedUser.role === "doctor"
                        ? "default"
                        : "secondary"
                    }
                    className="capitalize mt-1"
                  >
                    <Shield className="size-4 mr-2" />
                    {selectedUser.role}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium text-sm font-mono">{userId}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Joined Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedUser.createdAt), "MMM d, yyyy")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">
                    {format(new Date(selectedUser.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-2 mt-0.5">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Account Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(selectedUser.createdAt),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2 mt-0.5">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(selectedUser.createdAt),
                        "MMM d, h:mm a"
                      )}{" "}
                      (Today)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DrawerFooter className="flex flex-row justify-end gap-3 border-t pt-4">
          <Button variant="ghost">Edit Profile</Button>
          {!selectedUser.isEmailVerified && (
            <Button variant="secondary">Resend Verification</Button>
          )}
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
