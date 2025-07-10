import { useMutation } from "@tanstack/react-query";
import { DataServices } from "@/services/data/data-service";

const dataServices = new DataServices();
export const useSignInService = () => {
  return useMutation({
    mutationFn: async (credentials: LoginDto) => {
      const response = await dataServices.api.auth.login.post.call({
        json: credentials,
      });
      return response;
    },
  });
};
