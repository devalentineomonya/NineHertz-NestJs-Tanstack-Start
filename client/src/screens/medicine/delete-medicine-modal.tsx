import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteMedicineStore } from "@/stores/use-delete-medicine-store";
import { useDeleteMedicineService } from "@/services/medicines/use-delete-medicine";
import { Loader } from "lucide-react";
import { toast } from "sonner";

export function DeleteMedicineModal() {
  const { isOpen, onClose, medicineId } = useDeleteMedicineStore();
  const deleteMutation = useDeleteMedicineService();

  const handleDelete = async () => {
    if (!medicineId) return;

    try {
      await deleteMutation.mutateAsync(medicineId);
      toast.success("Medicine deleted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to delete medicine");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete Medicine
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            medicine record and remove all associated data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive font-medium text-center">
              Are you sure you want to delete this medicine?
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
              "Delete Medicine"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
