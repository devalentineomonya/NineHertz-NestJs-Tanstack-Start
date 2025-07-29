import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await dataServices.api.user.get.call();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
