import { useState, useEffect } from "react";
import {
  format,
  addDays,
  isToday,
  isTomorrow,
  parseISO,
  getDay,
} from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  X,
  Check,
  Stethoscope,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useGetAppointment } from "@/services/appointments/use-get-appointment";
import { useRescheduleAppointmentStore } from "@/stores/use-reschedule-appointment";

interface Availability {
  days: string[];
  hours: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DayAvailability {
  date: Date;
  slots: TimeSlot[];
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const RescheduleDrawer = () => {
  const { id, onClose, isOpen } = useRescheduleAppointmentStore();
  const { data: appointment } = useGetAppointment(id || "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    appointment?.datetime ? parseISO(appointment.datetime) : new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);

  // Function to convert time string to minutes
  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Generate real availability from doctor's schedule
  useEffect(() => {
    if (!isOpen || !appointment?.doctor?.availability) return;

    const generateAvailability = () => {
      const doctorAvailability: Availability = appointment.doctor.availability;
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const result: DayAvailability[] = [];

      // Generate for next 30 days
      for (let i = 0; i < 30; i++) {
        const date = addDays(now, i);
        const dayIndex = getDay(date); // 0 = Sunday, 1 = Monday, etc.
        const dayName = DAYS_OF_WEEK[dayIndex];

        // Check if doctor is available on this day
        const isDayAvailable = doctorAvailability.days.includes(dayName);
        const dayHours =
          doctorAvailability.hours[doctorAvailability.days.indexOf(dayName)] ||
          "";

        const timeSlots: TimeSlot[] = [];

        if (isDayAvailable && dayHours) {
          // Extract time range (e.g., "09:00-17:00")
          const [startTime, endTime] = dayHours.split("-");
          const startMinutes = convertTimeToMinutes(startTime);
          const endMinutes = convertTimeToMinutes(endTime);

          // Generate time slots every 60 minutes
          for (
            let minutes = startMinutes;
            minutes < endMinutes;
            minutes += 60
          ) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeString = `${hours.toString().padStart(2, "0")}:${mins
              .toString()
              .padStart(2, "0")}`;

            // Skip past times for today
            if (isToday(date) && minutes < currentMinutes) continue;

            timeSlots.push({
              time: timeString,
              available: true,
            });
          }
        }

        result.push({
          date,
          slots: timeSlots,
        });
      }

      setAvailability(result);

      // Pre-select original appointment time
      if (appointment?.datetime) {
        const originalDateTime = parseISO(appointment.datetime);
        setSelectedDate(originalDateTime);
        setSelectedTime(format(originalDateTime, "HH:mm"));
      }
    };

    generateAvailability();
  }, [isOpen, appointment]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleReschedule = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes, 0, 0);
      //   onReschedule(newDateTime);
      onClose();
    }
  };

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE");
  };

  const currentDayAvailability = availability.find(
    (avail) => avail.date.toDateString() === selectedDate?.toDateString()
  );

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
                Reschedule Appointment
              </DrawerTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select a new date and time for your appointment
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
                            parseISO(appointment.datetime),
                            "EEE, MMM d, yyyy 'at' h:mm a"
                          )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Consultation Fee
                      </p>
                      <p className="font-medium">
                        ${appointment?.doctor.consultationFee}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar and Time Selection */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    Select a Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date < new Date() || date > addDays(new Date(), 30)
                      }
                      className="rounded-md border"
                    />
                  </div>
                </CardContent>
              </Card>

              {selectedDate && currentDayAvailability && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Select a Time
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {currentDayAvailability.slots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {currentDayAvailability.slots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={
                              selectedTime === slot.time ? "default" : "outline"
                            }
                            onClick={() => setSelectedTime(slot.time)}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">
                          No availability for selected date
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

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
                  <div className="space-y-4">
                    {availability.slice(0, 3).map((day, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            {getDayLabel(day.date)} -{" "}
                            {format(day.date, "MMM d")}
                          </h3>
                          <Badge variant="secondary">
                            {day.slots.length} slots available
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {day.slots.slice(0, 4).map((slot, slotIndex) => (
                            <Button
                              key={slotIndex}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDate(day.date);
                                setSelectedTime(slot.time);
                              }}
                            >
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <DrawerFooter className="px-4 py-3 border-t bg-gray-50">
          <div>
            {selectedDate && selectedTime && (
              <p className="text-sm">
                <span className="text-muted-foreground">New appointment:</span>{" "}
                <span className="font-medium">
                  {format(selectedDate, "EEE, MMM d")} at {selectedTime}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-col w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={"primary"}
              onClick={handleReschedule}
              disabled={!selectedDate || !selectedTime}
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
