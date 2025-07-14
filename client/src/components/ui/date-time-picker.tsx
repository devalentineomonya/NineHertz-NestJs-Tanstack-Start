import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
interface DateTimePicker24hProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;

}

export const DateTimePicker24h = ({
  value,
  onChange,
  disabled = false,
}: DateTimePicker24hProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve existing time when changing date
      const newDate = new Date(selectedDate);
      if (value) {
        newDate.setHours(value.getHours());
        newDate.setMinutes(value.getMinutes());
      } else {
        // Default to 9:00 AM if no time set
        newDate.setHours(9, 0, 0, 0);
      }
      onChange(newDate);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", num: number) => {
    if (value) {
      const newDate = new Date(value);
      if (type === "hour") {
        newDate.setHours(num);
      } else if (type === "minute") {
        newDate.setMinutes(num);
      }
      onChange(newDate);
    } else {
      // Create new date with current date + selected time
      const newDate = new Date();
      if (type === "hour") {
        newDate.setHours(num);
      } else if (type === "minute") {
        newDate.setMinutes(num);
      }
      onChange(newDate);
    }
  };

  // Generate hours (0-23) and minutes (0, 5, 10, ..., 55)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="w-full" asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal truncate",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPPPppp") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            autoFocus
            disabled={disabled ? disabled : (date) => date < new Date()}
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-full sm:w-20">
              <div className="flex sm:flex-col  p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="sm"
                    variant={
                      value && value.getHours() === hour ? "default" : "ghost"
                    }
                    className="sm:w-full min-w-[40px] justify-center m-1"
                    onClick={() => handleTimeChange("hour", hour)}
                  >
                    {hour.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-full sm:w-20">
              <div className="flex sm:flex-col p-2">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    size="sm"
                    variant={
                      value && value.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full min-w-[40px] justify-center m-1"
                    onClick={() => handleTimeChange("minute", minute)}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
