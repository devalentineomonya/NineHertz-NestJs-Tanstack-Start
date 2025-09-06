import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetAdmins = () => {

  return useQuery<AdminPaginatedDto>({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await dataServices.api.admin.get.call();
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  });
};
