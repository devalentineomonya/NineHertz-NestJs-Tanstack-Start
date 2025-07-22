import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetInventoryItems = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const response = await dataServices.api["inventory-items"].get.call();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
