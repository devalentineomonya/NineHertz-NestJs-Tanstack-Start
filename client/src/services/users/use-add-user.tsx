import { useMutation } from "@tanstack/react-query";
import { DataServices } from "@/services/data/data-service";

const dataServices = new DataServices();
export const useAddUserService = () => {
  return useMutation({
    mutationFn: async (user: CreateUserDto) => {
      const response = await dataServices.api.user.post.call({
        json: user,
      });
      return response.data;
    },
  });
};
  