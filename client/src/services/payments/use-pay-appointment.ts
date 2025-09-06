import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useAppointmentPaymentService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InitiatePaymentDto) => {
      const response = await dataServices.api.transactions.initiate.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
