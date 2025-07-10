import { useMutation } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useAddAppointmentService = () => {
  const dataService = new DataServices();
  return useMutation({
    mutationFn: async (data: CreateAppointmentDto) => {
      const response = await dataService.api.appointments.post.call({
        json: data,
      });

      return response.data;
    },
  });
};
