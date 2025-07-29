import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { dataServices } from "../data/data-service";

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doctorId: string) => {
      const response = await dataServices.api.doctors._id(doctorId).delete.call({
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
