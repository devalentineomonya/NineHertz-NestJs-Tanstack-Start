import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetPharmacists = () => {
  const dataService = new DataServices();
  return useQuery({
    queryKey: ["pharmacists"],
    queryFn: async () => {
      const response = await dataService.api.pharmacists.get.call();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
