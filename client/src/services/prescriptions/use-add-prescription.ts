import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useAddPrescriptionService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePrescriptionDto) => {
      const response = await dataServices.api.prescriptions.post.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};
