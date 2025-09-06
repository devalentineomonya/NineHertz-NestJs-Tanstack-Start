import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetOrders = () => {
  return useQuery({
    queryFn: async () => {
      const response = await dataServices.api.orders.get.call();
      return response.data;
    },
    queryKey: ["orders"],
    staleTime: 5 * 60 * 1000,
  });
};
