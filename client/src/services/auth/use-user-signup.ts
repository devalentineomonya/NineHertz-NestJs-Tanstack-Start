import { useMutation } from "@tanstack/react-query";
import { DataServices } from "@/services/data/data-service";

const dataServices = new DataServices();
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
