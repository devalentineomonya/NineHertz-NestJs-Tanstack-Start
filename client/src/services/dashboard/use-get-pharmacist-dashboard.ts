import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPharmacistDashboard = () => {
  return useQuery({
    queryKey: ["pharmacist-dashboard"],
    queryFn: async () => {
      const response = await dataServices.api.dashboard.pharmacist.get.call();
      return response.data;
    },
  });
};
