import { AuthLayoutSkeleton } from "@/screens/auth/details-skeleton";
import { DataServices } from "@/services/data/data-service";
import { useUserSessionStore } from "@/stores/user-session-store";
import {
  createFileRoute,
  redirect,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";

const authTokensSearchSchema = z.object({
  accessToken: z.string().refine((token) => isValidJwt(token), {
    message: "Invalid access token",
  }),
  refreshToken: z.string().refine((token) => isValidJwt(token), {
    message: "Invalid refresh token",
  }),
  redirect: z.string().optional(),
});

function isValidJwt(token: string): boolean {
  try {
    const parts = token.split(".");
    return parts.length === 3;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/auth/callback")({
  component: RouteComponent,
  validateSearch: (tokens) => {
    const parsedTokens = authTokensSearchSchema.safeParse(tokens);
    if (!parsedTokens.success) {
      redirect({ to: "/auth/signin" });
    }
    return parsedTokens.data;
  },
});

function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.role || null;
  } catch (error) {
    console.error("Failed to decode token payload", error);
    return null;
  }
}

function replaceRoleInPath(path: string, newRole: string): string {
  if (!path.startsWith("/")) return `/${newRole}/dashboard`;

  const segments = path.split("/");
  if (segments.length >= 2) {
    segments[1] = newRole;
  }
  return segments.join("/");
}

function RouteComponent() {
  const search = useSearch({
    strict: false,
  }) as z.infer<typeof authTokensSearchSchema>;
  const navigate = useNavigate();
  const { setSession, getCurrentUser } = useUserSessionStore();
  const dataServices = useRef(new DataServices()).current;
  const user = getCurrentUser();
  const hasProcessed = useRef(false);
  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const verifyAndStoreTokens = async () => {
      try {
        const { accessToken, refreshToken, redirect: redirectUrl } = search;

        // Skip verification if tokens are already set
        if (
          useUserSessionStore.getState().session?.accessToken === accessToken
        ) {
          handleRedirect(user?.role, redirectUrl);
          return;
        }

        const response = await dataServices.api.auth.verifyTokens.post.call({
          json: {
            accessToken,
            refreshToken,
          },
        });

        if (response.data.success) {
          setSession({
            accessToken,
            refreshToken,
          });
          handleRedirect(
            getRoleFromToken(accessToken) || user?.role,
            redirectUrl
          );
        } else {
          toast.error("Token verification failed");
          navigate({ to: "/auth/signin" });
        }
      } catch (error) {
        toast.error("Failed to verify tokens");
        console.error("Token verification error:", error);
        navigate({ to: "/auth/signin" });
      }
    };

    const handleRedirect = (
      role: string | null | undefined,
      redirectUrl?: string
    ) => {
      if (!role) {
        toast.error("Failed to determine user role");
        navigate({ to: "/auth/signin" });
        return;
      }

      const targetPath = redirectUrl
        ? replaceRoleInPath(decodeURIComponent(redirectUrl), role)
        : `/${role}/dashboard`;

      navigate({ to: targetPath });
    };

    verifyAndStoreTokens();
  }, [search, setSession, navigate, dataServices, user?.role]);

  return <AuthLayoutSkeleton />;
}
