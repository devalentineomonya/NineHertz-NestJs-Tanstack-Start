import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPrescriptionsByPatient = (
  patientId: string,
  query?: Record<string, string | number | boolean>
) => {

  return useQuery({
    enabled: !!patientId,
    queryKey: ["prescriptions", "patient-prescription", patientId, query],
    queryFn: async () => {
      const response = await dataServices.api.prescriptions
        ._patientId(patientId)
        .get.call({
          params: query,
        });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
