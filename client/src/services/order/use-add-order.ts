import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useAddOrderService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderDto) => {
      const response = await dataServices.api.orders.post.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
