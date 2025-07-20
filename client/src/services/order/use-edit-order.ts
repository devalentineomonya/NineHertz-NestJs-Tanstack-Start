import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditOrderStore } from "@/stores/use-edit-order-store";
import { dataServices } from "../data/data-service";
import { toast } from "sonner";
export const useEditOrderService = () => {
  const queryClient = useQueryClient();

  let id: string;
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderDto }) => {
      const response = await dataServices.api.orders._id(id).patch.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: ({ id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      useEditOrderStore().onClose();
      toast.success("Order updated successfully");
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });
};
