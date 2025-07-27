import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useAddPrescriptionService = () => {
  const dataService = new DataServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePrescriptionDto) => {
      const response = await dataService.api.prescriptions.post.call({
        json: data,
      });
      return response.data;
    },
    onSuccess:  () => {
       queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};
