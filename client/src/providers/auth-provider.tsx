import { useUserSessionStore } from "@/services/users/stores/user-session-store";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getCurrentUser } = useUserSessionStore();
  const router = useRouter();
  const user = getCurrentUser();
  const pathname = window.location.pathname;

  useEffect(() => {
    if (!user) return;

    if (pathname.startsWith("/auth")) {
      router.navigate({
        to: `${user.role}/dashboard`,
        replace: true,
      });
    }
  }, [user, pathname, router]);

  return <>{children}</>;
}
