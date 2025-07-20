import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetPrescriptionsByPatient = (
  patientId: string,
  query?: Record<string, string | number | boolean>
) => {
  const dataService = new DataServices();

  return useQuery({
    enabled: !!patientId,
    queryKey: ["prescriptions", "patient-prescription", patientId, query],
    queryFn: async () => {
      const response = await dataService.api.prescriptions
        ._patientId(patientId)
        .get.call({
          params: query,
        });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
