import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetOrders = () => {
  const dataService = new DataServices();
  return useQuery({
    queryFn: async () => {
      const response = await dataService.api.orders.get.call();
      return response.data;
    },
    queryKey: ["orders"],
  });
};
