import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCancelOrderService } from "@/services/order/use-cancel-order";
import { useCancelOrderStore } from "@/stores/use-cancel-order-store";
import { Loader } from "lucide-react";
import { toast } from "sonner";

export function CancelOrderModal() {
  const { isOpen, onClose, orderId } = useCancelOrderStore();
  const cancelMutation = useCancelOrderService();

  const handleCancel = async () => {
    if (!orderId) return;

    try {
      await cancelMutation.mutateAsync(orderId);
      toast.success("Order cancelled successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Cancel Order</DialogTitle>
          <DialogDescription>
            This will permanently cancel the order and associated transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive font-medium text-center">
              Are you sure you want to cancel this order?
            </p>
            <p className="text-muted-foreground text-sm mt-2 text-center">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={cancelMutation.isPending}
          >
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin h-4 w-4" />
                Cancelling...
              </div>
            ) : (
              "Confirm Cancellation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
