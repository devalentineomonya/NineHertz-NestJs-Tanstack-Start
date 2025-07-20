import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useAddAppointmentService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAppointmentDto) => {
      const response = await dataServices.api.appointments.post.call({
        json: data,
      });

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
