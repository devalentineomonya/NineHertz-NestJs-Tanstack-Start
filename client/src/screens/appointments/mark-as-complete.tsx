import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMarkAsCompleteStore } from "@/stores/use-mark-as-complete-store";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "@/services/data/data-service";
import { Loader } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useMarkAppointmentAsComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await dataServices.api.appointments
        ._id(id)
        ["mark-as-complete"]()
        .patch.call();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      console.error("Error marking appointment as complete:", error);
    },
  });
};

export function MarkAsCompleteModal() {
  const { isOpen, onClose, appointmentId } = useMarkAsCompleteStore();
  const markAsCompleteHandler = useMarkAppointmentAsComplete();
  const handleComplete = async () => {
    try {
      await markAsCompleteHandler.mutateAsync(appointmentId ?? "");
      toast.success("Appointment successfully marked as complete");
      onClose();
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data.message
          : error instanceof Error
          ? error.message
          : "An error occurred while marking appointment as complete";

      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Completed</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this appointment as completed?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            disabled={markAsCompleteHandler.isPending}
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="w-fit"
            variant={"primary"}
            onClick={handleComplete}
            disabled={markAsCompleteHandler.isPending}
          >
            {markAsCompleteHandler.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Processing...
              </div>
            ) : (
              "Confirm Completion"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
