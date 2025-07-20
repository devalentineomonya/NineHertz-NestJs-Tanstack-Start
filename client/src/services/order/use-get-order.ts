import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetOrder = (id: string) => {
  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      const response = await dataServices.api.orders._id(id).get.call();
      return response.data;
    },
    queryKey: ["order", id],
    staleTime: 5 * 60 * 1000,
  });
};
