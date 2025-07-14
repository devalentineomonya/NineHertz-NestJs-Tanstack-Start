import { useDeletePharmacyStore } from "@/stores/use-delete-pharmacy-store";
// import { useDeletePharmacy } from "@/services/pharmacy/use-delete-pharmacy";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function DeletePharmacyConfirmModal() {
  const { isOpen, pharmacy, onClose } = useDeletePharmacyStore();
//   const { mutate: deletePharmacy, isPending } = useDeletePharmacy();

//   const handleDelete = () => {
//     if (pharmacy) {
//       deletePharmacy(pharmacy.id, {
//         onSuccess: () => onClose(),
//       });
//     }
//   };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Pharmacy</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {pharmacy?.name}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            // onClick={handleDelete}
            // disabled={isPending}
          >
            {/* {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Deleting..." : "Delete Pharmacy"} */}
            Delete Pharmacy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
