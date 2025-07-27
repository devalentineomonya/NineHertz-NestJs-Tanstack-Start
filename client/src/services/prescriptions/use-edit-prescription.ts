import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useEditPrescriptionService = () => {
  const dataService = new DataServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreatePrescriptionDto;
    }) => {
      const response = await dataService.api.prescriptions._id(id).patch.call({
        json: data,
      });
      return response.data;
    },
    onSuccess:  () => {
       queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};
