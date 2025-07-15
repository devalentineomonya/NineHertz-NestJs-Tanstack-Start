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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEditPharmacyStore } from "@/stores/use-edit-pharmacy";
import { useEffect } from "react";
import { useEditPharmacyService } from "@/services/pharmacies/use-edit-pharmacy";

// Reuse your existing schema
const pharmacyFormSchema = z.object({
  name: z.string().min(1, "Pharmacy name is required"),
  address: z.string().min(1, "Address is required"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  licenseNumber: z.string().min(1, "License number is required"),
});

type PharmacyFormValues = z.infer<typeof pharmacyFormSchema>;

export const EditPharmacyDrawer = () => {
  const { pharmacy, isOpen, onClose } = useEditPharmacyStore();
  const editPharmacyMutation = useEditPharmacyService();

  const form = useForm<PharmacyFormValues>({
    resolver: zodResolver(pharmacyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      contactPhone: "",
      licenseNumber: "",
    },
  });

  useEffect(() => {
    if (pharmacy) {
      form.reset({
        name: pharmacy.name,
        address: pharmacy.address,
        contactPhone: pharmacy.contactPhone,
        licenseNumber: pharmacy.licenseNumber,
      });
    }
  }, [pharmacy, form]);

  const onSubmit = async (data: PharmacyFormValues) => {
    if (!pharmacy?.id) return;

    try {
      await editPharmacyMutation.mutateAsync({
        id: pharmacy.id,
        data,
      });
      toast.success("Pharmacy updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update pharmacy");
    }
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Edit Pharmacy
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Pharmacy Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pharmacy Name</FormLabel>
                    <FormControl>
                      <Input placeholder="MedLife Pharmacy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, City, Country"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Phone */}
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
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
                      <Input placeholder="PH-123456789" {...field} />
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
            disabled={editPharmacyMutation.isPending}
          >
            {editPharmacyMutation.isPending ? "Updating..." : "Update Pharmacy"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
