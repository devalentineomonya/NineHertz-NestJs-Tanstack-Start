import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useAddMedicineService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMedicineDto) => {
      const response = await dataServices.api.medicines.post.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
};
