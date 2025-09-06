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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAddPharmacistStore } from "@/stores/use-add-pharmacist-store";
import { useAddPharmacistService } from "@/services/pharmacists/use-add-pharmacist";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGetUsers } from "@/services/users/use-get-users";
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

export const AddPharmacistDrawer = () => {
  const { isOpen, onClose } = useAddPharmacistStore();
  const addPharmacistMutation = useAddPharmacistService();
  const { data: availableUsers = [], isLoading: loadingUsers } = useGetUsers();

  const form = useForm<PharmacistFormValues>({
    resolver: zodResolver(pharmacistFormSchema),
    defaultValues: {
      fullName: "",
      licenseNumber: "",
      userId: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: PharmacistFormValues) => {
    try {
      await addPharmacistMutation.mutateAsync({
        fullName: data.fullName,
        licenseNumber: data.licenseNumber,
        userId: data.userId,
        phoneNumber: data.phoneNumber,
      });

      toast.success("Pharmacist profile created successfully");
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Failed to create pharmacist profile");
    }
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Create Pharmacist Profile
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* User Selection */}
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Pharmacist User</FormLabel>
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
                            disabled={loadingUsers}
                          >
                            {field.value
                              ? availableUsers.find(
                                  (user) => user.id === field.value
                                )?.email
                              : "Select user"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search pharmacist users..." />
                          <CommandList>
                            <CommandEmpty>
                              {loadingUsers
                                ? "Loading..."
                                : "No pharmacist users found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {availableUsers
                                .filter((user) => user.role === "pharmacist")
                                .map((user) => (
                                  <CommandItem
                                    value={user.email}
                                    key={user.id}
                                    onSelect={() => {
                                      form.setValue("userId", user.id);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        user.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {user.email}
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
            disabled={addPharmacistMutation.isPending}
          >
            {addPharmacistMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Creating...
              </div>
            ) : (
              "Create Pharmacist Profile"
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
