import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCancelAppointmentStore } from "@/stores/use-cancel-appointment-store";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCancelAppointment } from "@/services/appointments/use-cancel-appointment";

// Define validation schema
const cancelAppointmentSchema = z.object({
  reason: z
    .string()
    .min(10, {
      message: "Reason must be at least 10 characters long",
    })
    .max(500, {
      message: "Reason must be less than 500 characters",
    }),
});

type CancelAppointmentFormValues = z.infer<typeof cancelAppointmentSchema>;

export function CancelAppointmentModal() {
  const { isOpen, onClose, appointmentId } = useCancelAppointmentStore();
  const cancelAppointment = useCancelAppointment();
  const form = useForm<CancelAppointmentFormValues>({
    resolver: zodResolver(cancelAppointmentSchema),
    defaultValues: {
      reason: "",
    },
  });

  const { handleSubmit, reset } = form;

  const onSubmit = async (data: CancelAppointmentFormValues) => {
    try {
      console.log(
        "Canceling appointment:",
        appointmentId,
        "Reason:",
        data.reason
      );
      // Here you would typically call your API to cancel the appointment
      await cancelAppointment.mutateAsync({
        id: appointmentId ?? "",
        reason: data.reason,
      });
      onClose();
      reset();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? Please provide a
            reason.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for cancellation</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter your reason for cancellation (min. 10 characters)"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={handleClose}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Processing..."
                  : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
