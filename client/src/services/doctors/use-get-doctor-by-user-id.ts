import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetDoctorByUserId = (
  userId?: string,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: ["doctor", userId],
    enabled: enabled ?? !!userId,
    queryFn: async () => {
      if (!userId) return;
      const response = await dataServices.api.doctors.user
        ._userId(userId)
        .get.call();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
