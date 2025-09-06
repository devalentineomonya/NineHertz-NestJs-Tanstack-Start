import { useMutation } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

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
