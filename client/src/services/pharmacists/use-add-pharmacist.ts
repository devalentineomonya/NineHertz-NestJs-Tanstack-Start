import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useAddPharmacistService = () => {
  const dataService = new DataServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePharmacistDto) => {
      const response = await dataService.api.pharmacists.post.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pharmacists"] });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
