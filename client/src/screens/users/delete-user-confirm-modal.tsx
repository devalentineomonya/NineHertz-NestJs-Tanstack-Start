import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteUserStore } from "@/stores/use-delete-user-store";
import { useDeleteUser } from "@/services/users/use-delete-user";
import { Loader } from "lucide-react";

export function DeleteUserConfirmModal() {
  const { isOpen, userId, userRole, closeModal } = useDeleteUserStore();
  const handler = useDeleteUser();

  const actionText =
    userRole === "admin" ? "Revoke Admin" : "Deactivate Account";
  const descriptionText =
    userRole === "admin"
      ? "This will revoke the user's admin privileges. They will still have access to their account as a regular user."
      : "This will deactivate the user's account. They will no longer be able to access the system.";

  const handleConfirm = () => {
    if (userId) handler?.mutateAsync(userId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm {actionText}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
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
                Processing...
              </div>
            ) : (
              actionText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
