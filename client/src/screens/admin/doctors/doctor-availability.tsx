import { useDoctorAvailabilityStore } from "@/stores/use-doctor-availability-store";
import { useGetDoctorAvailability } from "@/services/doctors/use-get-doctor-availability";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { formatTime } from "@/lib/utils";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DoctorAvailabilityDrawer = () => {
  const { isOpen, doctorId, closeDrawer } = useDoctorAvailabilityStore();
  const { data, isLoading, error } = useGetDoctorAvailability(doctorId || "");

  // Group slots by day
  const groupedSlots = () => {
    const grouped: Record<string, any[]> = {};

    DAYS.forEach((day) => {
      grouped[day] = [];
    });

    data?.availableSlots?.forEach((slot: { day: string | number; }) => {
      grouped[slot.day]?.push({ ...slot, type: "available" });
    });

    data?.busySlots?.forEach((slot: { day: string | number; }) => {
      grouped[slot.day]?.push({ ...slot, type: "busy" });
    });

    // Sort slots by start time
    DAYS.forEach((day) => {
      grouped[day].sort((a, b) => a.start.localeCompare(b.start));
    });

    return grouped;
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={closeDrawer}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Doctor Availability
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="animate-spin" size={24} />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Failed to load availability data
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {DAYS.map((day) => {
                const slots = groupedSlots()[day] || [];

                return (
                  <div key={day} className="flex flex-col gap-2">
                    <div className="font-medium text-sm pb-1 border-b">
                      {day}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {slots.length === 0 ? (
                        <div className="text-gray-400 text-xs py-1">
                          No availability
                        </div>
                      ) : (
                        slots.map((slot, index) => (
                          <Badge
                            key={`${day}-${index}`}
                            variant={
                              slot.type === "available" ? "success" : "outline"
                            }
                            className="py-1 text-xs whitespace-nowrap"
                          >
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DrawerFooter className="flex flex-col justify-end gap-3 border-t pt-4">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
