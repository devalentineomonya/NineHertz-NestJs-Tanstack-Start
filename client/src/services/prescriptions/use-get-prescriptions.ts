import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetPrescriptions = () => {
  const dataService = new DataServices();
  return useQuery({
    queryFn: async () => {
      const response = await dataService.api.prescriptions.get.call();
      return response.data;
    },
    queryKey: ["prescriptions"],
    staleTime: 5 * 60 * 1000,
  });
};
