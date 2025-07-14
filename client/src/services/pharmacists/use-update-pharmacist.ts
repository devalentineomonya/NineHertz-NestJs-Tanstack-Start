import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useUpdatePharmacistService = () => {
  const dataService = new DataServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreatePharmacistDto;
    }) => {
      const response = await dataService.api.pharmacists._id(id).put.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users", "pharmacists"],
      });
    },
  });
};
