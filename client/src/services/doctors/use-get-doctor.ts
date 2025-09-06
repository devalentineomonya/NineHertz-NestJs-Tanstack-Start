import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetDoctor = (id?: string, enabled?: boolean) => {
  return useQuery({
    queryKey: ["doctor", id],
    enabled: enabled ?? !!id,
    queryFn: async () => {
      if (!id) return;
      const response = await dataServices.api.doctors._id(id).get.call();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
