import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useDeleteConsultationService = () => {
  const queryClient = useQueryClient();
  const dataService = new DataServices();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await dataService.api.consultations
        ._id(id)
        .delete.call();
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });
};
