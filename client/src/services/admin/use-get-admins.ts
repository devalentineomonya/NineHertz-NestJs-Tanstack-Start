import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetAdmins = () => {
  const dataService = new DataServices();
  return useQuery<AdminPaginatedDto>({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await dataService.api.admin.get.call();
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  });
};
