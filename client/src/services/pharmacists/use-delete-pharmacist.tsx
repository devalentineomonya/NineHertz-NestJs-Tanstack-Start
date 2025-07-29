import { useDeleteUserStore } from "@/stores/use-delete-user-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dataServices } from "../data/data-service";

export function useDeletePharmacist() {
  const { closeModal } = useDeleteUserStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pharmacistId: string) =>
      dataServices.api.pharmacists._id(pharmacistId).delete.call(),
    onSuccess: () => {
      toast.success("Pharmacist account has been deactivated");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["pharmacists"] });
    },
    onError: () => {
      toast.error("Failed to deactivate pharmacist account");
    },
  });
}
