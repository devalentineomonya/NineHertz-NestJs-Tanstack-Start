import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMarkAsCompleteStore } from "@/stores/use-mark-as-complete-store";

export function MarkAsCompleteModal() {
  const { isOpen, onClose, appointmentId } = useMarkAsCompleteStore();

  const handleComplete = () => {
    console.log("Marking as complete:", appointmentId);
    // Add your completion logic here
    onClose();
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="w-fit" variant={"primary"} onClick={handleComplete}>Confirm Completion</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
