import { useMutation } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useAddOrderService = () => {
  const dataService = new DataServices();
  return useMutation({
    mutationFn: async (data: CreateOrderDto) => {
      const response = await dataService.api.orders.post.call({
        json: data,
      });
      return response.data;
    },
  });
};
