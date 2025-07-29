import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetAppointments = () => {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const response = await dataServices.api.appointments.get.call();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
