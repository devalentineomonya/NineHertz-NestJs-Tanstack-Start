import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetAdminByUserId = (userId?: string, enabled?: boolean) => {
  return useQuery({
    queryKey: ["admin", userId],
    enabled: enabled ?? !!userId,
    queryFn: async () => {
      if (!userId) return;
      const response = await dataServices.api.admin.user
        ._userId(userId)
        .get.call();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
