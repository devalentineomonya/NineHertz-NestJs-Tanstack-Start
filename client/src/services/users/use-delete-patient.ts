import { useDeletePatientStore } from "@/stores/use-delete-patient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataServices } from "../data/data-service";

export function useDeletePatient() {
  const { closeModal } = useDeletePatientStore();
  const dataService = new DataServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patientId: string) =>
      dataService.api.patients._id(patientId).delete.call(),
    onSuccess: (_, patientId) => {
      toast.success("Patient account has been deactivated");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
    },
    onError: () => {
      toast.error("Failed to deactivate patient account");
    },
  });
}
