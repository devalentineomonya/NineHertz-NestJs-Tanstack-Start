import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { userFormSchema } from "./add-user-sheet";
import { useEditUser } from "@/stores/use-edit-user-store";

enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor",
  ADMIN = "admin",
  PHARMACIST = "pharmacist",
}

type UserFormValues = z.infer<typeof userFormSchema>;

export const EditUserDrawer = ({}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isOpen, onClose } = useEditUser();

  const form = useForm<Partial<UserFormValues>>({
    resolver: zodResolver(userFormSchema.partial()),
    defaultValues: {
      email: user?.email,
      role: user?.role,
    },
    values: {
      email: user?.email,
      role: user?.role,
    },
  });

  const onSubmit = async (data: Partial<UserFormValues>) => {
    try {
      setIsLoading(true);
      //   await onUpdate(data);
      toast.success("User information has been updated");
      onClose();
    } catch (error) {
      toast.error("Could not update user");
    } finally {
      setIsLoading(false);
    }
  };
  if (!user) return;

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Edit User
          </DrawerTitle>
          <p className="text-muted-foreground text-sm">ID: {user.id}</p>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="user@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label>User Role</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value) =>
                  form.setValue("role", value as UserRole)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verification Status */}
            <div>
              <Label>Email Verification</Label>
              <div className="mt-2">
                <Alert
                  variant={user.isEmailVerified ? "success" : "destructive"}
                >
                  <AlertTitle>
                    <div className="flex items-center gap-2">
                      {user.isEmailVerified ? (
                        <CheckCircle className="size-4" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      {user.isEmailVerified ? "Verified" : "Unverified"}
                    </div>
                  </AlertTitle>
                  <AlertDescription>
                    {user.isEmailVerified
                      ? "The user's email address has been verified."
                      : "The user's email address has not been verified."}
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </form>
        </div>

        <DrawerFooter className="flex flex-col justify-end gap-3 border-t pt-4">
          <Button
            variant={"primary"}
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update User"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
