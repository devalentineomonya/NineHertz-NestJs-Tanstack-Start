import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetPatients = () => {

  return useQuery({
    queryKey: [`patients`],
    queryFn: async () => {
      const response = await dataServices.api.patients.get.call();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
