import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useAddAdminService = () => {
  const dataService = new DataServices();
  const queryClient = useQueryClient();
  return useMutation<AdminResponseDto, unknown, CreateAdminDto>({
    mutationFn: async (newAdmin: CreateAdminDto) => {
      const response = await dataService.api.admin.post.call({
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
