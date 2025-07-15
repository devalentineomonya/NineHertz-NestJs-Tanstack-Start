// user-session-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

interface UserSession {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: "admin" | "patient" | "pharmacist" | "doctor";
  name?: string;
}

interface UserSessionStore {
  session: UserSession | null;
  setSession: (session: UserSession) => void;
  clearSession: () => void;
  getCurrentUser: () => {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
}

export const useUserSessionStore = create<UserSessionStore>()(
  persist(
    (set, get) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
      getCurrentUser: () => {
        const session = get().session;
        if (!session) return null;

        try {
          const decoded = jwtDecode<JwtPayload>(session.accessToken);
          return {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name || "User",
          };
        } catch (error) {
          console.error("Token decoding failed:", error);
          return null;
        }
      },
    }),
    {
      name: "user-session",
    }
  )
);
