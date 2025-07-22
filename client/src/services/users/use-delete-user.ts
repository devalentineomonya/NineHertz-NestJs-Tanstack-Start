import { useDeleteUserStore } from "@/stores/use-delete-user-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataServices } from "../data/data-service";

export function useDeleteUser() {
  const { closeModal } = useDeleteUserStore();
  const dataService = new DataServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) =>
      dataService.api.user._id(userId).delete.call(),
    onSuccess: (_, userId) => {
      toast.success("User account has been deactivated");
      closeModal();
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      queryClient.invalidateQueries({
        queryKey: ["patients"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admins"],
      });
      queryClient.invalidateQueries({
        queryKey: ["doctors"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pharmacists"],
      });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
    onError: () => {
      toast.error("Failed to deactivate user account");
    },
  });
}
