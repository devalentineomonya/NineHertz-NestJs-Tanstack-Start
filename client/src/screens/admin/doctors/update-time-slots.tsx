import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2, Plus, X, Loader } from "lucide-react";
import { useUpdateDoctorAvailabilityStore } from "@/stores/use-update-doctor-availability-store";
import { useUpdateDoctorService } from "@/services/doctors/use-update-doctor";
import { useEffect } from "react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const availabilitySchema = z.object({
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
});

type AvailabilityFormValues = z.infer<typeof availabilitySchema>;

export const UpdateDoctorAvailabilityDrawer = () => {
  const { isOpen, onClose, doctor } = useUpdateDoctorAvailabilityStore();
  const updateAvailability = useUpdateDoctorService();

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      availability: Array.isArray(doctor?.availability)
        ? doctor.availability
        : [],
    },
  });

  useEffect(() => {
    if (doctor) {
      form.reset({
        availability: Array.isArray(doctor.availability)
          ? doctor.availability.map((a) => ({
              day: a.day || "Monday",
              slots: Array.isArray(a.slots)
                ? a.slots.map((slot: any) => ({
                    start: slot.start || "09:00",
                    end: slot.end || "17:00",
                  }))
                : [],
            }))
          : [],
      });
    }
  }, [doctor, form]);

  const onSubmit = async (data: AvailabilityFormValues) => {
    if (!doctor) return;
    const availability = {
      days: data.availability.map((a) => a.day),
      hours: data.availability.flatMap((a) =>
        a.slots.map((slot) => `${slot.start}-${slot.end}`)
      ),
    };
    try {
      await updateAvailability.mutateAsync({
        doctorId: doctor.id,
        data: { ...doctor, availability },
      });
      toast.success("Availability updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update availability");
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

  if (!doctor) return null;

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-md bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Update Availability for Dr. {doctor.fullName}
          </DrawerTitle>
          <p className="text-sm text-gray-500">
            Specialist in {doctor.specialty}
          </p>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Weekly Availability</Label>
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

              {form.watch("availability")?.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">{day.day}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDay(dayIndex)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>

                  {day.slots.map((slot, slotIndex) => (
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
                        disabled={day.slots.length <= 1}
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

              {!form.watch("availability")?.length && (
                <div className="text-center py-8 text-gray-500">
                  No availability days added
                </div>
              )}
            </div>
          </form>
        </div>

        <DrawerFooter className="flex flex-col justify-end gap-3 border-t pt-4">
          <Button
            variant="primary"
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateAvailability.isPending}
          >
            {updateAvailability.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Updating...
              </div>
            ) : (
              "Save Changes"
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
