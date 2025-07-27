import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useEditAppointmentService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreateAppointmentDto;
    }) => {
      const response = await dataServices.api.appointments._id(id).patch.call({
        json: data,
      });

      return response.data;
    },
    onSuccess:  () => {
       queryClient.invalidateQueries({ queryKey: ["appointments"] });
       queryClient.invalidateQueries({ queryKey: ["doctorAvailability"] });
    },
  });
};
