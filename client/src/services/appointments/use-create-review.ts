import { useMutation } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useCreateReview = () => {
  return useMutation({
    mutationFn: async (reviewData: CreateReviewDto) => {
      const response = await dataServices.api.appointments
        ._id(reviewData.appointmentId)
        .reviews.call({
          json: reviewData,
        });

      return response.data;
    },
  });
};
