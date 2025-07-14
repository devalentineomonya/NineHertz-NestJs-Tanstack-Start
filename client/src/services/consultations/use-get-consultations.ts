import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetConsultations = () => {
  const dataService = new DataServices();
  return useQuery({
    queryKey: ["consultations"],
    queryFn: async () => {
      const result = await dataService.api.consultations.get.call();
      return result.data;
    },
  });
};
