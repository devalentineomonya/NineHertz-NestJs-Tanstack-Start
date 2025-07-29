import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useAddPatientService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      newPatient,
    }: {
      userId: string;
      newPatient: CreatePatientDto;
    }) => {
      const response = await dataServices.api.patients
        ._userId(userId)
        .post.call({
          json: newPatient,
        });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
