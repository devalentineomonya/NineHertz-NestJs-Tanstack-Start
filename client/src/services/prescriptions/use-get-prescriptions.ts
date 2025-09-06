import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPrescriptions = () => {
  return useQuery({
    queryFn: async () => {
      const response = await dataServices.api.prescriptions.get.call();
      return response.data;
    },
    queryKey: ["prescriptions"],
    staleTime: 5 * 60 * 1000,
  });
};
