import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

const dataService = new DataServices();

export const useGetAppointments = () => {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const response = await dataService.api.appointments.get.call();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
