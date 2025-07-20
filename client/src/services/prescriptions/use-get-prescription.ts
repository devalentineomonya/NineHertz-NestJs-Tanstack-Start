import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetPrescription = (
  id: string,
  query?: { [key: string]: string | number | Date }[]
) => {
  const dataService = new DataServices();

  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      const response = await dataService.api.prescriptions._id(id).get.call({
        params: query,
      });
      return response.data;
    },
    queryKey: ["prescription", id, query],
    staleTime: 5 * 60 * 1000,
  });
};
