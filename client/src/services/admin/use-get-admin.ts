import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetAdmin = (id?: string, enabled?: boolean) => {
  return useQuery({
    enabled: enabled ?? !!id,
    queryFn: async () => {
      if (!id) return;
      const response = await dataServices.api.admin._id(id).get.call();
      return response.data;
    },
    queryKey: ["admin", id],
  });
};
