import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useUpdatePatientService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updatedData,
    }: {
      id: string;
      updatedData: UpdatePatientDto;
    }) => {
      const response = await dataServices.api.patients._id(id).put.call({
        json: updatedData,
      });
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
