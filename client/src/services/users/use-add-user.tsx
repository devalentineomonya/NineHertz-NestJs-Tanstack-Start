import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "@/services/data/data-service";

export const useAddUserService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: CreateUserDto) => {
      const response = await dataServices.api.user.post.call({
        json: user,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      queryClient.invalidateQueries({
        queryKey: ["patients"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admins"],
      });
      queryClient.invalidateQueries({
        queryKey: ["doctors"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pharmacists"],
      });
    },
  });
};
