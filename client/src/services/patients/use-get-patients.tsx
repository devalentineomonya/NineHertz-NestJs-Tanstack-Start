import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetPatients = () => {
  const dataService = new DataServices();
  return useQuery({
    queryKey: [`patients`],
    queryFn: async () => {
      const response = await dataService.api.patients.get.call();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
