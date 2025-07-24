import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetAdminDashboard = () => {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await dataServices.api.dashboard.admin.get.call();
      return response.data;
    },
  });
};
