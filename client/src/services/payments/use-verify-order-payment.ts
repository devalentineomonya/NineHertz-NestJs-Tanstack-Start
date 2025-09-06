import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useVerifyOrderPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { reference: string; gateway: Gateway }) => {
      const response = await dataServices.api.transactions.verify.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
