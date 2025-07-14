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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEditPharmacistStore } from "@/stores/use-edit-pharmacist-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGetPharmacies } from "@/services/pharmacies/use-get-pharmacies";
import { useUpdatePharmacistService } from "@/services/pharmacists/use-update-pharmacist";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";

const pharmacistFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  licenseNumber: z
    .string()
    .min(2, "License number must be at least 2 characters"),
  pharmacyId: z.string().min(1, "Pharmacy selection is required"),
});

type PharmacistFormValues = z.infer<typeof pharmacistFormSchema>;

export const UpdatePharmacistDrawer = () => {
  const { isOpen, pharmacist, onClose, id } = useEditPharmacistStore();
  const updatePharmacistMutation = useUpdatePharmacistService();
  const { data: pharmacies = [], isLoading: loadingPharmacies } =
    useGetPharmacies();

  const form = useForm<PharmacistFormValues>({
    resolver: zodResolver(pharmacistFormSchema),
    defaultValues: {
      fullName: "",
      licenseNumber: "",
      pharmacyId: "",
    },
  });

  // Pre-fill form when pharmacist data changes
  useEffect(() => {
    if (pharmacist) {
      form.reset({
        fullName: pharmacist.fullName,
        licenseNumber: pharmacist.licenseNumber,
        pharmacyId: pharmacist.pharmacy.id,
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
          pharmacyId: data.pharmacyId,
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

              {/* Pharmacy Selection */}
              <FormField
                control={form.control}
                name="pharmacyId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pharmacy</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={loadingPharmacies}
                          >
                            {field.value
                              ? pharmacies.find(
                                  (pharmacy) => pharmacy.id === field.value
                                )?.name
                              : "Select pharmacy"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search pharmacies..." />
                          <CommandList>
                            <CommandEmpty>
                              {loadingPharmacies
                                ? "Loading..."
                                : "No pharmacies found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {pharmacies.map((pharmacy) => (
                                <CommandItem
                                  value={pharmacy.name}
                                  key={pharmacy.id}
                                  onSelect={() => {
                                    form.setValue("pharmacyId", pharmacy.id);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      pharmacy.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {pharmacy.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
