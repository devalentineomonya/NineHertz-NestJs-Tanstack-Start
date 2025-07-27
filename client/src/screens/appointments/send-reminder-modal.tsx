import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dataServices } from "@/services/data/data-service";
import { useSendReminderStore } from "@/stores/use-send-reminder-store";
import { AxiosError } from "axios";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SendReminderModal() {
  const { isOpen, onClose, appointmentId } = useSendReminderStore();
  const [isLoading, setIsLoading] = useState(false);
  const handleSend = async () => {
    setIsLoading(true);
    try {
      await dataServices.api.appointments
        ._id(appointmentId ?? "")
        ["send-reminder"]()
        .post.call();
      onClose();
      toast.success("Reminder sent successfully!");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data.message
          : error instanceof Error
          ? error.message
          : "An error occurred while sending appointment reminders";
      toast.success(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Reminder</DialogTitle>
          <DialogDescription>
            Send a reminder notification to the client about this appointment?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="w-fit" variant={"primary"} onClick={handleSend}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Sending...
              </div>
            ) : (
              "Send Reminder"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
