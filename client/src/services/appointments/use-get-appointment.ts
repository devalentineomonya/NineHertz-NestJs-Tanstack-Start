import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetAppointment = (id: string) => {
  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      const response = await dataServices.api.appointments._id(id).get.call();
      return response.data;
    },
    queryKey: ["appointment", id],
  });
};
