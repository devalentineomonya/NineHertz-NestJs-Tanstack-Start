import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useUpdatePatientService = () => {
  const queryClient = useQueryClient();
  const dataService = new DataServices();

  return useMutation({
    mutationFn: async ({
      id,
      updatedData,
    }: {
      id: string;
      updatedData: UpdatePatientDto;
    }) => {
      const response = await dataService.api.patients._id(id).put.call({
        json: updatedData,
      });
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", "users"] });
    },
  });
};
