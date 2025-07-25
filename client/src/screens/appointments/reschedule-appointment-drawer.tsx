import { useState, useEffect, useMemo } from "react";
import { format, addDays, isToday, isTomorrow, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  Stethoscope,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useGetAppointment } from "@/services/appointments/use-get-appointment";
import { useRescheduleAppointmentStore } from "@/stores/use-reschedule-appointment";
import { DateTimePicker24h } from "@/components/ui/date-time-picker";
import { useGetDoctorAvailability } from "@/services/doctors/use-get-doctor-availability";
import { toast } from "sonner";
import { Loader } from "lucide-react";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface TimeSlot {
  start: string;
  end: string;
}

export const RescheduleDrawer = () => {
  const { id, onClose, isOpen } = useRescheduleAppointmentStore();
  const { data: appointment } = useGetAppointment(id || "");
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(
    appointment?.datetime ? appointment.datetime : new Date()
  );
  const [dayOfWeek, setDayOfWeek] = useState<string>("");
  const { data: availability, isLoading: loadingAvailability } =
    useGetDoctorAvailability(appointment?.doctor.id || "", dayOfWeek);

  // Calculate available time slots
  const availableTimeSlots = useMemo(() => {
    if (!selectedDateTime || !availability) return [];

    const dateStr = selectedDateTime.toISOString().split("T")[0];
    const dayOfWeek = selectedDateTime.toLocaleDateString("en-US", {
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
  }, [selectedDateTime, availability]);

  const getAvailableSlotsForDate = (date: Date) => {
    if (!availability) return [];

    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = date.toISOString().split("T")[0];

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
  };

  // Generate next 3 days with actual availability
  const upcomingAvailabilityDays = useMemo(() => {
    if (!availability) return [];

    return [1, 2, 3].map((daysToAdd) => {
      const date = addDays(new Date(), daysToAdd);
      return {
        date,
        label: getDayLabel(date),
        availableSlots: getAvailableSlotsForDate(date),
      };
    });
  }, [availability]);

  // Update day of week when date changes
  useEffect(() => {
    if (selectedDateTime) {
      const day = selectedDateTime.toLocaleDateString("en-US", {
        weekday: "long",
      });
      setDayOfWeek(day);
    }
  }, [selectedDateTime]);

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

  const handleReschedule = async () => {
    if (!selectedDateTime) return;

    // Validate selected time slot
    const isValidTime = validateSelectedTime(selectedDateTime);
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

    try {
      // Here you would call your reschedule mutation
      // await rescheduleAppointmentMutation.mutateAsync({
      //   id: appointment?.id,
      //   newDateTime: selectedDateTime
      // });

      toast.success("Appointment rescheduled successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to reschedule appointment");
    }
  };

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE");
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            Reschedule Appointment
          </DrawerTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select a new date and time for your appointment
          </p>
        </DrawerHeader>

        <ScrollArea className="h-[calc(100dvh-280px)] px-4">
          <div className="flex flex-col gap-6 py-4">
            {/* Doctor Information */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-500" />
                    Doctor Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    <div>
                      <h3 className="font-bold">
                        Dr. {appointment?.doctor.fullName}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {appointment?.doctor.specialty}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        License: {appointment?.doctor.licenseNumber}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Original Appointment
                      </p>
                      <p className="font-medium">
                        {appointment?.datetime &&
                          format(
                            appointment.datetime,
                            "EEE, MMM d, yyyy 'at' h:mm a"
                          )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Appointment Fee
                      </p>
                      <p className="font-medium">
                        ${appointment?.doctor.appointmentFee}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Date and Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  Select New Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <DateTimePicker24h
                    value={selectedDateTime}
                    onChange={(date) => {
                      if (!date) return;
                      setSelectedDateTime(date);
                    }}
                    disabled={loadingAvailability}
                  />
                </div>

                {/* Available Time Slots */}
                {selectedDateTime && (
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Available Time Slots for{" "}
                      {format(selectedDateTime, "MMMM d, yyyy")}
                    </h3>

                    {loadingAvailability ? (
                      <div className="flex justify-center py-4">
                        <Loader className="animate-spin" />
                      </div>
                    ) : availableTimeSlots.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-2">
                        No available time slots for selected date
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableTimeSlots.map(
                          (slot: TimeSlot, index: number) => {
                            const slotTime = new Date(selectedDateTime!);
                            const [hours, minutes] = slot.start
                              .split(":")
                              .map(Number);
                            slotTime.setHours(hours, minutes);

                            const isSelected =
                              selectedDateTime?.getTime() ===
                              slotTime.getTime();

                            return (
                              <Button
                                key={index}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                onClick={() => setSelectedDateTime(slotTime)}
                                className="h-9 text-xs"
                              >
                                {slot.start} - {slot.end}
                              </Button>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Upcoming Availability
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Next available slots for Dr. {appointment?.doctor.fullName}
                </p>
              </CardHeader>
              <CardContent>
                {loadingAvailability ? (
                  <div className="flex justify-center py-4">
                    <Loader className="animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAvailabilityDays.map((day, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            {day.label} - {format(day.date, "MMM d")}
                          </h3>
                          <Badge
                            variant={
                              day.availableSlots.length > 0
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {day.availableSlots.length > 0
                              ? `${day.availableSlots.length} slots available`
                              : "No availability"}
                          </Badge>
                        </div>

                        {day.availableSlots.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {day.availableSlots
                              .slice(0, 4) // Limit to 4 slots per day
                              .map((slot: TimeSlot, slotIndex: number) => {
                                const slotTime = new Date(day.date);
                                const [hours, minutes] = slot.start
                                  .split(":")
                                  .map(Number);
                                slotTime.setHours(hours, minutes);

                                return (
                                  <Button
                                    key={slotIndex}
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedDateTime(slotTime)
                                    }
                                  >
                                    {slot.start}
                                  </Button>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DrawerFooter className="px-4 py-3 border-t bg-gray-50">
          <div>
            {selectedDateTime && (
              <p className="text-sm">
                <span className="text-muted-foreground">New appointment:</span>{" "}
                <span className="font-medium">
                  {format(selectedDateTime, "EEE, MMM d, yyyy 'at' h:mm a")}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-col w-full">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button
              variant={"primary"}
              onClick={handleReschedule}
              disabled={
                !selectedDateTime || !validateSelectedTime(selectedDateTime)
              }
              className="gap-1"
            >
              <Check className="h-4 w-4" />
              Confirm Reschedule
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
