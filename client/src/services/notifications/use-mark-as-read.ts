import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";
import { toast } from "sonner";

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await dataServices.api.notifications._id_read(id).patch.call();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification marked successfully");
    },
  });
};
