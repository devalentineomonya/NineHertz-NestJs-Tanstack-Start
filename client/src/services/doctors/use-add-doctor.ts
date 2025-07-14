import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useAddDoctorService = () => {
  const dataService = new DataServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDoctorDto) => {
      const response = await dataService.api.doctors.post.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctors", "users"] });
    },
  });
};
