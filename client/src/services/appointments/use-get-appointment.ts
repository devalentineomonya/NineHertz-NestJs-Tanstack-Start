import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetAppointment = (id: string) => {
  const dataService = new DataServices();
  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      const response = await dataService.api.appointments._id(id).get.call();
      return response.data;
    },
    queryKey: ["appointment", id],
  });
};
