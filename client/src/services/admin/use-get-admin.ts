import { useQuery } from "@tanstack/react-query";

export const useAvailableAdminUsers = () => {
  return useQuery<AdminPaginatedDto[]>({
    queryKey: ["admin"],
    queryFn: async () => {
      const response = await fetch("/api/users/admins/available");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};
