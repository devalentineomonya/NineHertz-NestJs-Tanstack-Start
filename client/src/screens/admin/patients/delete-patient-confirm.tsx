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
import { useDeletePatientStore } from "@/stores/use-delete-patient";
import { useDeletePatient } from "@/services/patients/use-delete-patient";

export function DeletePatientConfirmModal() {
  const { isOpen,patientId, closeModal } = useDeletePatientStore();
  const handler = useDeletePatient();

  const handleConfirm = () => {
    if (patientId) handler?.mutateAsync(patientId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Patient Deletion</DialogTitle>
          <DialogDescription>
            This will permanently delete the patient's account and their
            associated medical data.
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
            disabled={handler.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={handler.isPending}
          >
            {handler.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Deleting...
              </div>
            ) : (
              "Delete Patient"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
