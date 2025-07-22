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
import { useAddDoctorStore } from "@/stores/use-add-doctor-store";
import { useAddDoctorService } from "@/services/doctors/use-add-doctor";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader, Plus, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import { DoctorFormValues, daysOfWeek, doctorFormSchema } from "./doctor-date";

export const AddDoctorDrawer = () => {
  const { isOpen, onClose } = useAddDoctorStore();
  const addDoctorMutation = useAddDoctorService();
  const { data: availableUsers = [], isLoading: loadingUsers } = useGetUsers();

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      fullName: "",
      specialty: "",
      availability: [],
      appointmentFee: 0,
      licenseNumber: "",
      userId: "",
    },
  });

  const onSubmit = async (data: DoctorFormValues) => {
    try {
      // Convert availability to DTO format
      const availability = {
        days: data.availability.map((a) => a.day),
        hours: data.availability.flatMap((a) =>
          a.slots.map((slot) => `${slot.start}-${slot.end}`)
        ),
      };

      await addDoctorMutation.mutateAsync({
        ...data,
        availability,
      });

      toast.success("Doctor profile created successfully");
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Failed to create doctor profile");
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
            Create Doctor Profile
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
                      <PopoverContent align="start" className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search users..." />
                          <CommandList>
                            <CommandEmpty>
                              {loadingUsers ? "Loading..." : "No users found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {availableUsers
                                .filter((user) => user.role === "doctor")
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

              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Jane Smith" {...field} />
                    </FormControl>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="endocrinology">
                          Endocrinology
                        </SelectItem>
                        <SelectItem value="gastroenterology">
                          Gastroenterology
                        </SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="oncology">Oncology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="radiology">Radiology</SelectItem>
                        <SelectItem value="urology">Urology</SelectItem>
                      </SelectContent>
                    </Select>
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

              {/* Appointment Fee */}
              <FormField
                control={form.control}
                name="appointmentFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Fee</FormLabel>
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
            disabled={addDoctorMutation.isPending}
          >
            {addDoctorMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Creating...
              </div>
            ) : (
              "Create Doctor Profile"
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
