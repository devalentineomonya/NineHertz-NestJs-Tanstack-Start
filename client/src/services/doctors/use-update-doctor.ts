import { useMutation } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useUpdateDoctorService = () => {
  const dataService = new DataServices();
  return useMutation({
    mutationFn: async ({
      doctorId,
      data,
    }: {
      doctorId: string;
      data: UpdateDoctorDto;
    }) => {
      const response = await dataService.api.doctors._id(doctorId).patch.call({
        json: data,
      });
      return response.data;
    },
  });
};
