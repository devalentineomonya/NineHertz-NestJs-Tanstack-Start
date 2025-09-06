import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { useDeletePharmacistStore } from "@/stores/use-delete-pharmacist-store";
import { useDeletePharmacist } from "@/services/pharmacists/use-delete-pharmacist";

export function DeletePharmacistConfirmModal() {
  const { isModalOpen, pharmacistId, closeModal } = useDeletePharmacistStore();
  const deleteMutation = useDeletePharmacist();

  const handleConfirm = async () => {
    if (pharmacistId) {
      try {
        await deleteMutation.mutateAsync(pharmacistId);
        closeModal();
      } catch (error) {
        // Error handling is done in the mutation
      }
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Confirm Pharmacist Deletion
          </DialogTitle>
          <DialogDescription className="pt-2">
            This will permanently delete the pharmacist's profile and remove
            their association with any pharmacies. All related records will be
            permanently removed from our systems.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
            <li>Pharmacist profile will be permanently deleted</li>
            <li>License information will be removed</li>
            <li>Pharmacy assignments will be revoked</li>
            <li>This action cannot be undone</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={deleteMutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            className="w-full sm:w-auto"
          >
            {deleteMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin h-4 w-4" />
                Deleting...
              </div>
            ) : (
              "Delete Pharmacist"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
