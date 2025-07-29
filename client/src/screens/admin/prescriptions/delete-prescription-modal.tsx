import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeletePrescriptionService } from "@/services/prescriptions/use-delete-prescription";
import { useDeletePrescriptionStore } from "@/stores/use-delete-prescription-store";

import { Loader } from "lucide-react";
import { toast } from "sonner";

export function DeletePrescriptionModal() {
  const { isOpen, onClose, prescriptionId } = useDeletePrescriptionStore();
  const deleteMutation = useDeletePrescriptionService();

  const handleDelete = async () => {
    if (!prescriptionId) return;

    try {
      await deleteMutation.mutateAsync(prescriptionId);
      toast.success("Prescription deleted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to delete prescription");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete Prescription
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            prescription record.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive font-medium text-center">
              Are you sure you want to delete this prescription?
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin h-4 w-4" />
                Deleting...
              </div>
            ) : (
              "Delete Prescription"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
