import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useFulfillPrescriptionService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePrescriptionDto;
    }) => {
      const response = await dataServices.api.prescriptions._id(id).patch.call({
        json: data,
      });
      return response.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};
