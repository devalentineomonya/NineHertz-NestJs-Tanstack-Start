import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { DataServices } from "../data/data-service";

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  const dataService = new DataServices();
  return useMutation({
    mutationFn: async (doctorId: string) => {
      const response = await dataService.api.doctors._id(doctorId).delete.call({
        params: { id: doctorId },
      });

      return response.data;
    },
    onSuccess:  () => {
       queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete doctor");
    },
  });
};
