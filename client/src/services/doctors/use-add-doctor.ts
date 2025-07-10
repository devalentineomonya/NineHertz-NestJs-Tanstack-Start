import { useMutation } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useAddDoctorService = () => {
  const dataService = new DataServices();
  return useMutation({
    mutationFn: async (data: CreateDoctorDto) => {
      const response = await dataService.api.doctors.post.call({
        json: data,
      });
      return response.data;
    },
  });
};
