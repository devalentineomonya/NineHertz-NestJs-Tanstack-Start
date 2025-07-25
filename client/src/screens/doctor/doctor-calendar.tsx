import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { startOfWeek, getDay, format, parse } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddAppointmentStore } from "@/stores/use-add-appointment-store";
import { useGetDoctorAvailability } from "@/services/doctors/use-get-doctor-availability";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSessionStore } from "@/stores/user-session-store";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patient: {
    id: string;
    name: string;
  };
  type: "consultation" | "checkup" | "procedure" | "availability";
};

export function DoctorScheduler() {
  const { getCurrentUser } = useUserSessionStore();
  const currentUser = getCurrentUser();
  const { data: availability, isLoading } = useGetDoctorAvailability(
    currentUser?.id || ""
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [view, setView] = useState<keyof typeof Views>(
    Views.WEEK as keyof typeof Views
  );
  const [date, setDate] = useState(new Date());
  const { onOpen: onAddAppointment } = useAddAppointmentStore();

  // Transform availability data into calendar events
  useMemo(() => {
    if (!availability) return;

    const availabilityEvents: Event[] = availability.flatMap(
      (slot: Availability) => {
        return {
          id: `available-${slot.hours.join(",")}`,
          title: "Available",
          patient: { id: "", name: "" },
          type: "availability",
        };
      }
    );

    // Merge with existing appointments (if any)
    setEvents((prev) => [
      ...prev.filter((e) => e.type !== "availability"),
      ...availabilityEvents,
    ]);
  }, [availability]);

  const eventStyleGetter = useCallback((event: Event) => {
    const styleMap = {
      consultation: { backgroundColor: "#3b82f6" },
      checkup: { backgroundColor: "#10b981" },
      procedure: { backgroundColor: "#ef4444" },
      availability: {
        backgroundColor: "#e5e7eb",
        border: "1px dashed #9ca3af",
        color: "#4b5563",
      },
    };

    return {
      style: {
        ...styleMap[event.type],
        borderRadius: "4px",
        opacity: 0.8,
        border: "0px",
      },
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-[800px] p-4">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="h-[800px] p-4">
      <div className="flex justify-between mb-4">
        <Button onClick={() => setDate(new Date())}>Today</Button>
        <Select value={view} onValueChange={(value) => setView(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Views.DAY}>Day</SelectItem>
            <SelectItem value={Views.WEEK}>Week</SelectItem>
            <SelectItem value={Views.MONTH}>Month</SelectItem>
            <SelectItem value={Views.AGENDA}>Agenda</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={{ month: true, week: true, day: true, agenda: true }}
        view={view as unknown as View}
        onView={(view) => setView(view as keyof typeof Views)}
        date={date}
        onNavigate={setDate}
        selectable
        onSelectSlot={(slotInfo) => {
          // Check if selected slot is within availability
          const isAvailable = events.some(
            (e) =>
              e.type === "availability" &&
              e.start <= slotInfo.start &&
              e.end >= slotInfo.end
          );

          if (isAvailable) {
            onAddAppointment();
          }
        }}
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: () => null,
          event: ({ event }) => (
            <div className="py-1 px-2 text-xs">
              {event.type === "availability"
                ? "Available"
                : `${event.title} - ${event.patient.name}`}
            </div>
          ),
        }}
      />
    </div>
  );
}
