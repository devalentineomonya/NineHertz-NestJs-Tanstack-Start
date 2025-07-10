import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetConsultation = () => {
  const dataService = new DataServices();
  return useQuery({
    queryKey: ["consultation"],
    queryFn: async () => {
      const result = await dataService.api.consultations.get.call();
      return result.data;
    },
  });
};
