import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPatient = (id?: string, enabled?: boolean) => {
  return useQuery({
    enabled: enabled ?? !!id,
    queryKey: [`patient`, id],
    queryFn: async () => {
      if (!id) return;
      const response = await dataServices.api.patients._id(id).get.call({
        params: { id },
      });
      return response;
    },

    staleTime: 1000 * 60 * 5,
  });
};
