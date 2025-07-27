import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useEditMedicineService = () => {
  const dataService = new DataServices();
  const queryClient = useQueryClient();
  let patientId: string;
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreateMedicineDto;
    }) => {
      patientId = id;
      const response = await dataService.api.medicines._id(id).patch.call({
        json: data,
      });
      return response.data;
    },
    onSuccess:  () => {
       queryClient.invalidateQueries({ queryKey: ["medicines"] });
       queryClient.invalidateQueries({
        queryKey: ["medicine", patientId],
      });
    },
  });
};
