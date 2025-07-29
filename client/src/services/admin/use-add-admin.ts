import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useAddAdminService = () => {

  const queryClient = useQueryClient();
  return useMutation<AdminResponseDto, unknown, CreateAdminDto>({
    mutationFn: async (newAdmin: CreateAdminDto) => {
      const response = await dataServices.api.admin.post.call({
        json: newAdmin,
      });
      return response.data;
    },
    onSuccess:  () => {
       queryClient.invalidateQueries({ queryKey: ["admins"] });
       queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
