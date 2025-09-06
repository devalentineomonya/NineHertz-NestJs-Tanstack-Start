import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ["notification"],
    queryFn: async () => {
      const response = await dataServices.api.notifications.get.call();
      return response.data;
    },
  });
};
