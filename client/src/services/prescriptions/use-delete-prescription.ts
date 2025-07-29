import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useDeletePrescriptionService = () => {
  let id: string | null = null;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      id = id;
      const response = await dataServices.api.prescriptions
        ._id(id)
        .delete.call();

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["prescription", id] });
    },
  });
};
