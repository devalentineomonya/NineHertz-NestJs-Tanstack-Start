import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetPharmacies = () => {
  const dataService = new DataServices();
  return useQuery({
    queryFn: async () => {
      const response = await dataService.api.pharmacies.get.call();
      return response.data;
    },
    queryKey: ["pharmacies"],
    staleTime: 5 * 60 * 1000,
  });
};
