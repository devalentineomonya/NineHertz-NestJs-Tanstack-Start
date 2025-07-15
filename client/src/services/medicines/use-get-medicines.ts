import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetMedicines = () => {
  const dataService = new DataServices();
  return useQuery({
    queryFn: async () => {
      const response = await dataService.api.medicines.get.call();
      return response.data;
    },
    queryKey: ["medicines"],
  });
};
