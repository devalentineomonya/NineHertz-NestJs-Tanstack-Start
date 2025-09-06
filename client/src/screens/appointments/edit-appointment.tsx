import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker24h } from "@/components/ui/date-time-picker";
import { cn } from "@/lib/utils";
import { useGetDoctors } from "@/services/doctors/use-get-doctors";
import { useGetPatients } from "@/services/patients/use-get-patients";
import { useEditAppointmentService } from "@/services/appointments/use-edit-appointment";
import { useGetAppointment } from "@/services/appointments/use-get-appointment";
import { useEditAppointmentStore } from "@/stores/use-edit-appointment-store";
import { useGetDoctorAvailability } from "@/services/doctors/use-get-doctor-availability";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  appointmentFormSchema,
  AppointmentFormValues,
  appointmentModes,
  appointmentStatuses,
  appointmentTypes,
} from "./appointment-data";

export const EditAppointmentDrawer = () => {
  const { isOpen, onClose, appointmentId } = useEditAppointmentStore();
  const { data: appointment, isLoading: loadingAppointment } =
    useGetAppointment(appointmentId || "");
  const editAppointmentMutation = useEditAppointmentService();
  const { data: patients, isLoading: loadingPatients } = useGetPatients();
  const { data: doctors, isLoading: loadingDoctors } = useGetDoctors();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [dayOfWeek, setDayOfWeek] = useState<string>("");
  const { data: availability, isLoading: loadingAvailability } =
    useGetDoctorAvailability(selectedDoctorId, dayOfWeek);
  const [showTimeSlotError, setShowTimeSlotError] = useState(false);
  const [tempPatientName, setTempPatientName] = useState("");
  const [tempDoctorName, setTempDoctorName] = useState("");

  const durationMinutes = 30;

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      datetime: new Date(),
      status: "scheduled",
      type: "consultation",
      mode: "physical",
      patientId: "",
      doctorId: "",
      videoSessionId: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (appointment && patients && doctors) {
      const appointmentDate = new Date(appointment.datetime);

      const patient = patients.find((p) => p.id === appointment.patientId);
      const doctor = doctors.data?.find((d) => d.id === appointment.doctorId);

      form.reset({
        ...appointment,
        datetime: appointmentDate,
      });

      if (patient) setTempPatientName(patient.fullName);
      if (doctor) setTempDoctorName(doctor.fullName);

      setSelectedDoctorId(appointment.doctorId);
      const day = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      setDayOfWeek(day);
    }
  }, [appointment, patients, doctors]);
  // Update day of week when date changes
  useEffect(() => {
    if (form.watch("datetime")) {
      const day = form
        .watch("datetime")
        .toLocaleDateString("en-US", { weekday: "long" });
      setDayOfWeek(day);
    }
  }, [form.watch("datetime")]);

  // Update selected doctor when changed
  useEffect(() => {
    const doctorId = form.watch("doctorId");
    if (doctorId) {
      setSelectedDoctorId(doctorId);
    }
  }, [form.watch("doctorId")]);

  // Calculate available time slots
  const availableTimeSlots = useMemo(() => {
    const selectedDate = form.watch("datetime");
    if (!selectedDate || !availability) return [];

    const dateStr = selectedDate.toISOString().split("T")[0];
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const dayAvailability = availability.availableSlots.filter(
      (slot: { day: string }) => slot.day === dayOfWeek
    );

    const busySlots = availability.busySlots.filter(
      (slot: { date: string }) => slot.date === dateStr
    );

    return dayAvailability.filter(
      (availSlot: { start: string; end: string }) =>
        !busySlots.some(
          (busySlot: { start: string; end: string }) =>
            busySlot.start === availSlot.start && busySlot.end === availSlot.end
        )
    );
  }, [form.watch("datetime"), availability]);

  // Validate selected time slot
  const validateSelectedTime = (date: Date): boolean => {
    if (!availability || !date) return false;

    const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    return availableTimeSlots.some(
      (slot: { start: string }) => slot.start === timeStr
    );
  };

  const onSubmit = async (data: AppointmentFormValues) => {
    if (!appointmentId) return;

    try {
      // Validate selected time slot
      const isValidTime = validateSelectedTime(data.datetime);
      if (!isValidTime) {
        toast.warning(
          "Selected time is not available. Please choose a time from the available slots.",
          {
            duration: 5000,
            position: "top-center",
            action: {
              label: "OK",
              onClick: () => {},
            },
          }
        );
        return;
      }

      // Calculate end time based on fixed duration
      const endTime = new Date(data.datetime);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);

      await editAppointmentMutation.mutateAsync({
        id: appointmentId,
        data: {
          ...data,
          endTime,
          status: data.status as AppointmentStatus,
          startTime: data.datetime,
          duration: durationMinutes,
        },
      });

      toast.success("Appointment updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  const isSubmitting = editAppointmentMutation.isPending;
  const isVirtual = form.watch("mode") === "virtual";

  // Update datetime picker when time slot is selected
  const handleTimeSlotSelect = (slotTime: Date) => {
    form.setValue("datetime", slotTime);
    setShowTimeSlotError(false);
  };

  if (loadingAppointment) {
    return (
      <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
          <div className="flex items-center justify-center h-full">
            <Loader className="animate-spin h-8 w-8 text-primary" />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Edit Appointment #{appointment?.id}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                onSubmit as SubmitHandler<AppointmentFormValues>
              )}
              className="space-y-6"
            >
              {/* Patient Selection */}
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Patient</FormLabel>
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
                            disabled={isSubmitting || loadingPatients}
                          >
                            {field.value
                              ? patients?.find(
                                  (patient) => patient.id === field.value
                                )?.fullName ||
                                (loadingPatients
                                  ? "Loading..."
                                  : tempPatientName)
                              : "Select patient"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search patients..." />
                          <CommandList>
                            <CommandEmpty>
                              {loadingPatients
                                ? "Loading..."
                                : "No patients found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {patients?.map((patient) => (
                                <CommandItem
                                  value={patient.fullName}
                                  key={patient.id}
                                  onSelect={() => {
                                    form.setValue("patientId", patient.id);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      patient.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {patient.fullName}
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

              {/* Doctor Selection */}
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Doctor</FormLabel>
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
                            disabled={isSubmitting || loadingPatients}
                          >
                            {field.value
                              ? patients?.find(
                                  (patient) => patient.id === field.value
                                )?.fullName || "Loading patient..." // Simplified display
                              : "Select patient"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search doctors..." />
                          <CommandList>
                            <CommandEmpty>
                              {loadingDoctors
                                ? "Loading..."
                                : "No doctors found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {doctors?.data?.map((doctor) => (
                                <CommandItem
                                  value={doctor.fullName}
                                  key={doctor.id}
                                  onSelect={() => {
                                    form.setValue("doctorId", doctor.id);
                                    setSelectedDoctorId(doctor.id);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      doctor.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {doctor.fullName} ({doctor.specialty})
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

              {/* Date & Time Picker */}
              <FormItem className="flex flex-col">
                <FormLabel>Date & Time</FormLabel>
                <DateTimePicker24h
                  value={form.watch("datetime")}
                  onChange={(date) => {
                    if (!date) return;
                    form.setValue("datetime", date);
                  }}
                  disabled={
                    !selectedDoctorId || isSubmitting || loadingAvailability
                  }
                />
              </FormItem>

              {/* Available Time Slots */}
              {selectedDoctorId && (
                <FormField
                  control={form.control}
                  name="datetime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Available Time Slots</FormLabel>
                      {loadingAvailability ? (
                        <div className="flex justify-center py-4">
                          <Loader className="animate-spin" />
                        </div>
                      ) : availableTimeSlots.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No available time slots for selected date
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {availableTimeSlots.map(
                            (slot: { start: string; end: string }) => {
                              const slotTime = new Date(form.watch("datetime"));
                              const [hours, minutes] = slot.start
                                .split(":")
                                .map(Number);
                              slotTime.setHours(hours, minutes);

                              const isSelected =
                                form.watch("datetime")?.getTime() ===
                                slotTime.getTime();
                              const isInvalid = showTimeSlotError && isSelected;

                              return (
                                <Button
                                  key={`${slot.start}-${slot.end}`}
                                  type="button"
                                  variant={isSelected ? "default" : "outline"}
                                  onClick={() => {
                                    handleTimeSlotSelect(slotTime);
                                  }}
                                  disabled={isSubmitting}
                                  className={cn(
                                    "h-9 text-xs",
                                    isInvalid &&
                                      "ring-2 ring-destructive ring-offset-2"
                                  )}
                                >
                                  {slot.start} - {slot.end}
                                </Button>
                              );
                            }
                          )}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Appointment Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Appointment Mode */}
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Mode</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointmentModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Video Session ID (conditional) */}
              {isVirtual && (
                <FormField
                  control={form.control}
                  name="videoSessionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Session ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter video session ID"
                          {...field}
                          disabled
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Duration Info */}
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <div className="rounded-md border px-4 py-2 text-sm">
                  30 minutes (fixed)
                </div>
              </FormItem>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add appointment notes..."
                        className="resize-none"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointmentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            disabled={isSubmitting || availableTimeSlots.length === 0}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Updating...
              </div>
            ) : (
              "Update Appointment"
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
