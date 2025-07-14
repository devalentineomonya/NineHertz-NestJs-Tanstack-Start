import { DataServices } from "../data/data-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAddPatientService = () => {
  const dataService = new DataServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      newPatient,
    }: {
      userId: string;
      newPatient: CreatePatientDto;
    }) => {
      const response = await dataService.api.patients
        ._userId(userId)
        .post.call({
          json: newPatient,
        });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", "users"] });
    },
  });
};
