import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPatientByUserId = (userId?: string, enabled?: boolean) => {
  return useQuery({
    enabled: enabled ?? !!userId,
    queryKey: [`patient`, userId],
    queryFn: async () => {
      if (!userId) return;
      const response = await dataServices.api.patients
        ._userId(userId)
        .get.call({
          params: { userId },
        });
      return response;
    },

    staleTime: 1000 * 60 * 5,
  });
};
