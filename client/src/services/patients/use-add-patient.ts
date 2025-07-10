import { DataServices } from "../data/data-service";
import { useMutation } from "@tanstack/react-query";

export const useAddPatientService = () => {
  const dataService = new DataServices();
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
  });
};
