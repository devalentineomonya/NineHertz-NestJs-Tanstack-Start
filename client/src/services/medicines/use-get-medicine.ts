import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetMedicine = (id: string) => {
  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      const response = await dataServices.api.medicines._id(id).get.call();
      return response.data;
    },
    queryKey: ["medicine", id],
  });
};
