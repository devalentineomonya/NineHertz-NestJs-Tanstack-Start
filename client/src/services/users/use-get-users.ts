import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

const dataService = new DataServices();

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await dataService.api.user.get.call();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
