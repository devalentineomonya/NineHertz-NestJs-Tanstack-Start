import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useAddPharmacyService = () => {
  const dataService = new DataServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePharmacyDto) => {
      const response = await dataService.api.pharmacies.post.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacies"] });
    },
  });
};
