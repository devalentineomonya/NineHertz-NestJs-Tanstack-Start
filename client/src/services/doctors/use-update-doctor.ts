import { useMutation } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useUpdateDoctorService = () => {

  return useMutation({
    mutationFn: async ({
      doctorId,
      data,
    }: {
      doctorId: string;
      data: UpdateDoctorDto;
    }) => {
      const response = await dataServices.api.doctors._id(doctorId).patch.call({
        json: data,
      });
      return response.data;
    },
  });
};
