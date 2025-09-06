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

import { useEditPharmacistStore } from "@/stores/use-edit-pharmacist-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdatePharmacistService } from "@/services/pharmacists/use-update-pharmacist";
import { PhoneInput } from "@/components/ui/phone-input";

const pharmacistFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  licenseNumber: z
    .string()
    .min(2, "License number must be at least 2 characters"),
  userId: z.string().min(1, "User selection is required"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be a valid E.164 format"),
});
type PharmacistFormValues = z.infer<typeof pharmacistFormSchema>;

export const UpdatePharmacistDrawer = () => {
  const { isOpen, pharmacist, onClose, id } = useEditPharmacistStore();
  const updatePharmacistMutation = useUpdatePharmacistService();

  const form = useForm<PharmacistFormValues>({
    resolver: zodResolver(pharmacistFormSchema),
    defaultValues: {
      fullName: "",
      licenseNumber: "",
      phoneNumber: "",
    },
  });

  // Pre-fill form when pharmacist data changes
  useEffect(() => {
    if (pharmacist) {
      form.reset({
        fullName: pharmacist.fullName,
        licenseNumber: pharmacist.licenseNumber,
        phoneNumber: pharmacist.phoneNumber,
      });
    }
  }, [pharmacist, form]);

  const onSubmit = async (data: PharmacistFormValues) => {
    if (!pharmacist || !id) return;

    try {
      await updatePharmacistMutation.mutateAsync({
        id,
        data: {
          userId: pharmacist.userId,
          fullName: data.fullName,
          licenseNumber: data.licenseNumber,
        },
      });

      toast.success("Pharmacist profile updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update pharmacist profile");
    }
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Update Pharmacist Profile
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* User Display (Read-only) */}
              <div className="space-y-2">
                <Label>Associated User</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 text-gray-600">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{pharmacist?.user?.email || "Loading..."}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  User account cannot be changed after creation
                </p>
              </div>

              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        placeholder="Enter your phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* License Number */}
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="PH123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DrawerFooter className="flex flex-col justify-end gap-3 border-t pt-4">
          <Button
            variant="primary"
            onClick={form.handleSubmit(onSubmit)}
            disabled={updatePharmacistMutation.isPending}
          >
            {updatePharmacistMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Updating...
              </div>
            ) : (
              "Update Pharmacist Profile"
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
