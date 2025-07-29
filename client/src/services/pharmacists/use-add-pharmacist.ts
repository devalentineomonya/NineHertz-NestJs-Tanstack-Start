import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useAddPharmacistService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePharmacistDto) => {
      const response = await dataServices.api.pharmacists.post.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacists"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
