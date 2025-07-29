import { useMutation } from "@tanstack/react-query";
import { dataServices } from "@/services/data/data-service";

export const useSignupService = () => {
  return useMutation({
    mutationFn: async (credentials: SignUpDto) => {
      const response = await dataServices.api.auth.signup.post.call({
        json: credentials,
      });
      return response;
    },
  });
};
