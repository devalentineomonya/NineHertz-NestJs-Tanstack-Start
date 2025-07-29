import { useQuery } from "@tanstack/react-query";
import { dataServices } from "@/services/data/data-service";

export const useGetTransactions = () => {
  return useQuery({
    queryFn: async () => {
      const response = await dataServices.api.transactions.get.call();
      return response.data;
    },
    queryKey: ["transactions"],
  });
};
