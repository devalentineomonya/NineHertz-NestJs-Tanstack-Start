import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSendReminderStore } from "@/stores/use-send-reminder-store";

export function SendReminderModal() {
  const { isOpen, onClose, appointmentId } = useSendReminderStore();

  const handleSend = () => {
    console.log("Sending reminder for:", appointmentId);
    // Add your reminder sending logic here
    onClose();
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
          <Button onClick={handleSend}>Send Reminder</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
