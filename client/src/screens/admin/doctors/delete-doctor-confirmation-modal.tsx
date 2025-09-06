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
import { useDeleteDoctorStore } from "@/stores/use-delete-doctor-store";
import { useDeleteDoctor } from "@/services/doctors/use-delete-doctor";

export function DeleteDoctorConfirmModal() {
  const { isOpen, doctorId, closeModal } = useDeleteDoctorStore();
  const deleteMutation = useDeleteDoctor();

  const handleConfirm = async () => {
    if (doctorId) {
      await deleteMutation.mutateAsync(doctorId);
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Doctor Deletion</DialogTitle>
          <DialogDescription>
            This will permanently delete the doctor's profile and their
            associated schedule and appointments.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600">
            This action cannot be undone. Are you sure you want to proceed?
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Deleting...
              </div>
            ) : (
              "Delete Doctor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
