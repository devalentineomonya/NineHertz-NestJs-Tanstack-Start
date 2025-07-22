import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPharmacists = () => {
  return useQuery({
    queryKey: ["pharmacists"],
    queryFn: async () => {
      const response = await dataServices.api.pharmacists.get.call();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
