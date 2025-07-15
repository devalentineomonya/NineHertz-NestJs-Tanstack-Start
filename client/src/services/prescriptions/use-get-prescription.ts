import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetPrescription = (id: string) => {
  const dataService = new DataServices();

  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      const response = await dataService.api.prescriptions._id(id).get.call();
      return response.data;
    },
    queryKey: ["prescription", id],
    staleTime: 5 * 60 * 1000,
  });
};
