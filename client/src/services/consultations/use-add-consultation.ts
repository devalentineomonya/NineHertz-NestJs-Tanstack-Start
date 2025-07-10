import { useMutation } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useAddConsultationService = () => {
  const dataService = new DataServices();
  return useMutation({
    mutationFn: async (data: CreateConsultationDto) => {
      const response = await dataService.api.consultations.post.call({
        json: data,
      });
      return response.data;
    },
  });
};
