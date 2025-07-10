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
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddAdminStore } from "@/stores/use-add-admin-store";
import { useAddAdminService } from "@/services/admin/use-add-admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader, Plus, Trash2, X } from "lucide-react";
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

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

enum AdminType {
  SUPER_ADMIN = "super",
  SUPPORT_ADMIN = "support",
}

const adminFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  adminType: z.nativeEnum(AdminType),
  userUuid: z.string().min(1, "User selection is required"),
  specialty: z.string().min(2, "Specialty must be at least 2 characters"),
  availability: z.array(
    z.object({
      day: z.enum(daysOfWeek),
      slots: z.array(
        z.object({
          start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        })
      ),
    })
  ),
  consultationFee: z
    .number()
    .min(0, "Consultation fee must be a positive number"),
  licenseNumber: z
    .string()
    .min(2, "License number must be at least 2 characters"),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export const AddAdminDrawer = () => {
  const { isOpen, onClose } = useAddAdminStore();
  const addAdminMutation = useAddAdminService();
  const { data: availableUsers = [], isLoading: loadingUsers } = useGetUsers();

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      fullName: "",
      adminType: AdminType.SUPPORT_ADMIN,
      userUuid: "",
      specialty: "",
      availability: [],
      consultationFee: 0,
      licenseNumber: "",
    },
  });

  const onSubmit = async (data: AdminFormValues) => {
    try {
      // Convert availability to DTO format
      const availability = {
        days: data.availability.map((a) => a.day),
        hours: data.availability.flatMap((a) =>
          a.slots.map((slot) => `${slot.start}-${slot.end}`)
        ),
      };

      await addAdminMutation.mutateAsync({
        ...data,
        availability,
      });

      toast.success("Admin profile created successfully");
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Failed to create admin profile");
    }
  };

  const addDayAvailability = () => {
    const currentAvailability = [...form.getValues("availability")];
    const unselectedDays = daysOfWeek.filter(
      (day) => !currentAvailability.some((a) => a.day === day)
    );

    if (unselectedDays.length > 0) {
      form.setValue("availability", [
        ...currentAvailability,
        { day: unselectedDays[0], slots: [{ start: "09:00", end: "17:00" }] },
      ]);
    }
  };

  const addTimeSlot = (dayIndex: number) => {
    const currentAvailability = [...form.getValues("availability")];
    currentAvailability[dayIndex].slots.push({
      start: "09:00",
      end: "17:00",
    });
    form.setValue("availability", currentAvailability);
  };

  const removeDay = (dayIndex: number) => {
    const currentAvailability = [...form.getValues("availability")];
    currentAvailability.splice(dayIndex, 1);
    form.setValue("availability", currentAvailability);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const currentAvailability = [...form.getValues("availability")];
    currentAvailability[dayIndex].slots.splice(slotIndex, 1);
    form.setValue("availability", currentAvailability);
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Create Admin Profile
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* User Selection */}
              <FormField
                control={form.control}
                name="userUuid"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select User</FormLabel>
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
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search users..." />
                          <CommandList>
                            <CommandEmpty>
                              {loadingUsers ? "Loading..." : "No users found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {availableUsers
                                .filter(
                                  (user) =>
                                    user.role === "admin" && !user.profile
                                )
                                .map((user) => (
                                  <CommandItem
                                    value={user.email}
                                    key={user.id}
                                    onSelect={() => {
                                      form.setValue("userUuid", user.id);
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

              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admin Type */}
              <FormField
                control={form.control}
                name="adminType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select admin type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AdminType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0) + word.slice(1).toLowerCase()
                              )
                              .join(" ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specialty */}
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <FormControl>
                      <Input placeholder="Cardiology" {...field} />
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
                      <Input placeholder="MD123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Consultation Fee */}
              <FormField
                control={form.control}
                name="consultationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Availability */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Availability</Label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addDayAvailability}
                    disabled={
                      form.watch("availability")?.length >= daysOfWeek.length
                    }
                  >
                    <Plus size={16} className="mr-1" /> Add Day
                  </Button>
                </div>

                {form
                  .watch("availability")
                  ?.map((dayAvailability, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">
                          {dayAvailability.day}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDay(dayIndex)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>

                      {dayAvailability.slots.map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          className="flex justify-between gap-2 mb-2 items-center"
                        >
                          <Input
                            type="time"
                            value={slot.start}
                            onChange={(e) => {
                              const newAvailability = [
                                ...form.getValues("availability"),
                              ];
                              newAvailability[dayIndex].slots[slotIndex].start =
                                e.target.value;
                              form.setValue("availability", newAvailability);
                            }}
                          />
                          <span className="text-center">to</span>
                          <Input
                            type="time"
                            value={slot.end}
                            onChange={(e) => {
                              const newAvailability = [
                                ...form.getValues("availability"),
                              ];
                              newAvailability[dayIndex].slots[slotIndex].end =
                                e.target.value;
                              form.setValue("availability", newAvailability);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                            className="text-red-500"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => addTimeSlot(dayIndex)}
                      >
                        <Plus size={16} className="mr-1" /> Add Time Slot
                      </Button>
                    </div>
                  ))}

                {form.formState.errors.availability && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.availability.message}
                  </p>
                )}
              </div>
            </form>
          </Form>
        </div>

        <DrawerFooter className="flex flex-col justify-end gap-3 border-t pt-4">
          <Button
            variant="primary"
            onClick={form.handleSubmit(onSubmit)}
            disabled={addAdminMutation.isPending}
          >
            {addAdminMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Creating...
              </div>
            ) : (
              "Create Admin Profile"
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
