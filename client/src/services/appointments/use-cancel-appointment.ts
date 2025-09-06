import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reason, id }: { id: string; reason: string }) => {
      const response = await dataServices.api.appointments
        .cancel(id)
        .patch.call({
          json: { reason },
        });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctorAvailability"] });
    },
  });
};
