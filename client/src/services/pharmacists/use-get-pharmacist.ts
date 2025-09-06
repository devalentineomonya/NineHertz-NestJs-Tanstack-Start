import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPharmacist = (id?: string, enabled?: boolean) => {
  return useQuery({
    queryKey: ["pharmacist", id],
    enabled: enabled ?? !!id,
    queryFn: async () => {
      if (!id) return;
      const response = await dataServices.api.pharmacists._id(id).get.call();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
