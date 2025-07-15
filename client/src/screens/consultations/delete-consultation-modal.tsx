import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteConsultationStore } from "@/stores/use-delete-consultation-store";
import { useDeleteConsultationService } from "@/services/consultations/use-delete-consultation";
import { toast } from "sonner";
import { Loader } from "lucide-react";

export function DeleteConsultationModal() {
  const { isOpen, onClose, consultationId } = useDeleteConsultationStore();
  const deleteMutation = useDeleteConsultationService();

  const handleDelete = async () => {
    if (!consultationId) return;

    try {
      await deleteMutation.mutateAsync(consultationId);
      toast.success("Consultation deleted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to delete consultation");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Consultation</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the consultation record
            and remove all associated data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive font-medium text-center">
              Are you sure you want to delete this consultation?
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
              "Delete Consultation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
