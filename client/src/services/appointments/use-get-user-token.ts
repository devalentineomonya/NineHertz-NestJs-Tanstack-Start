// useGetUserToken hook
import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetUserToken = (callId: string) => {
  return useQuery({
    queryKey: ["video-token", callId],
    queryFn: async () => {
      if (!callId) throw new Error("Missing call ID");

      try {
        const response = await dataServices.api.appointments
          .videoToken(callId)
          .get.call();
        return response.data;
      } catch (error: any) {
        const backendMessage = error.response?.data?.message;
        if (backendMessage) {
          throw new Error(backendMessage);
        }
        throw new Error(error.message || "Failed to get video token");
      }
    },
    enabled: !!callId,
    retry: (failureCount, error) => {
      if (
        error.message.includes("appointment") ||
        error.message.includes("cancelled") ||
        error.message.includes("virtual")
      ) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
};
