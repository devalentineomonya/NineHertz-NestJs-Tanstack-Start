import { useMutation } from "@tanstack/react-query";
import { dataServices } from "@/services/data/data-service";

export const useVerifyWithOTP    = () => {
  return useMutation({
    mutationFn: async (credentials: VerifyEmailDto) => {
      const response = await dataServices.api.auth.email.verify.post.call({
        json: credentials,
      });
      return response;
    },
  });
};
