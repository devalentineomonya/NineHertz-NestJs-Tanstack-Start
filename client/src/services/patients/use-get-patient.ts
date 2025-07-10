import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetPatient = (id: string) => {
  const dataService = new DataServices();
  return useQuery({
    enabled: !!id,
    queryKey: [`patient-${id}`],
    queryFn: async () => {
      const response = await dataService.api.patients._id(id).get.call({
        params: { id },
      });
      return response;
    },

    staleTime: 1000 * 60 * 5,
  });
};
