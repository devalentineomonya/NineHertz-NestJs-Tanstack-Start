import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export function useGetMedicines(params?: {
  page?: number;
  limit?: number;
} & { [key: string]: string | number | Date }) {
  return useQuery({
    queryFn: async () => {
      const response = await dataServices.api.medicines.get.call({
        params: params,
      });
      return response.data;
    },
    queryKey: ["medicines", params],
    staleTime: 5 * 60 * 1000,
  });
}
