import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useAddDoctorService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDoctorDto) => {
      const response = await dataServices.api.doctors.post.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
