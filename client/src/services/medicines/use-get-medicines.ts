import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetMedicines = (
  query?: { [key: string]: string | number | Date }[]
) => {
  return useQuery({
    queryFn: async () => {
      const response = await dataServices.api.medicines.get.call({
        params: query,
      });
      return response.data;
    },
    queryKey: ["medicines", query],
    staleTime: 5 * 60 * 1000,
  });
};
