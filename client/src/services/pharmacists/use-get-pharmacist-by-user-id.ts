import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPharmacistByUserId = (userId?: string, enabled?: boolean) => {
  return useQuery({
    queryKey: ["pharmacist", userId],
    enabled: enabled ?? !!userId,
    queryFn: async () => {
      if (!userId) return;
      const response = await dataServices.api.pharmacists.user
        ._userId(userId)
        .get.call();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
