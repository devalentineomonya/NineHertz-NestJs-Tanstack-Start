import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPrescription = (
  id: string,
  query?: { [key: string]: string | number | Date }[]
) => {
  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      const response = await dataServices.api.prescriptions._id(id).get.call({
        params: query,
      });
      return response.data;
    },
    queryKey: ["prescription", id, query],
    staleTime: 5 * 60 * 1000,
  });
};
