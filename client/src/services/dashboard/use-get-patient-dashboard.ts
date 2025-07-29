import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPatientDashboard = () => {
  return useQuery({
    queryKey: ["patient-dashboard"],
    queryFn: async () => {
      const response = await dataServices.api.dashboard.patient.get.call();
      return response.data;
    },
  });
};
