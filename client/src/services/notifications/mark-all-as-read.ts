import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";
import { toast } from "sonner";

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await dataServices.api.notifications._all_read().patch.call();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notifications marked successfully");
    },
  });
};
