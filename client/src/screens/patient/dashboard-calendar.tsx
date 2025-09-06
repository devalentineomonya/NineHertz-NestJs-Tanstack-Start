import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";

import { startOfWeek, getDay, format, parse } from "date-fns";
import { enUS } from "date-fns/locale";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
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
  type: "consultation" | "checkup" | "procedure";
};

export function PatientScheduler() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Annual Checkup - John Doe",
      start: new Date(2023, 10, 1, 10, 0),
      end: new Date(2023, 10, 1, 10, 30),
      patient: { id: "p1", name: "John Doe" },
      type: "checkup",
    },
    // Add more sample events...
  ]);

  const [view, setView] = useState<keyof typeof Views>(
    Views.WEEK as keyof typeof Views
  );
  const [date, setDate] = useState(new Date());
  const { onOpen: onAddAppointment } = useAddAppointmentStore();

  const eventStyleGetter = (event: Event) => {
    let backgroundColor = "";
    switch (event.type) {
      case "consultation":
        backgroundColor = "#3b82f6"; // blue
        break;
      case "checkup":
        backgroundColor = "#10b981"; // green
        break;
      case "procedure":
        backgroundColor = "#ef4444"; // red
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
      },
    };
  };

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
        onView={(view) => setView(view.toUpperCase() as keyof typeof Views)}
        date={date}
        onNavigate={setDate}
        selectable
        onSelectSlot={() => onAddAppointment()}
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: () => null,
        }}
      />
    </div>
  );
}
