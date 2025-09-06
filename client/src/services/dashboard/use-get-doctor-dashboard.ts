import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetDoctorDashboard = () => {
  return useQuery({
    queryKey: ["doctor-dashboard"],
    queryFn: async () => {
      const response = await dataServices.api.dashboard.doctor.get.call();
      return response.data;
    },
  });
};
