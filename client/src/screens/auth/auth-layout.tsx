import { useUserSessionStore } from "@/stores/user-session-store";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

function replaceRoleInPath(path: string, newRole: string): string {
  if (!path) return `/${newRole}/dashboard`;
  if (!path.startsWith("/")) return `/${newRole}/dashboard`;
  const cleanPath = path.replace(/^(\/[^/]+)\/.*?\1/, "$1");

  const segments = cleanPath.split("/");
  if (segments.length >= 2) {
    segments[1] = newRole;
  }
  return segments.join("/");
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const session = useUserSessionStore((state) => state.session);
  const getCurrentUser = useUserSessionStore((state) => state.getCurrentUser);
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const redirectTo = search?.redirect
    ? decodeURIComponent(String(search.redirect))
    : null;

  const hasRedirected = useRef(false);
  const user = session ? getCurrentUser() : null;

  useEffect(() => {
    if (session && user && !hasRedirected.current) {
      hasRedirected.current = true;
      const cleanRedirect = redirectTo
        ? redirectTo.replace(/(\/[^/]+)(?:\/.*?\1)/, "$1")
        : null;

      const targetPath = cleanRedirect
        ? replaceRoleInPath(cleanRedirect, user.role)
        : `/${user.role}/dashboard`;
      const finalPath = targetPath.replace(/([^:]\/)\/+/g, "$1");

      toast.info(`Redirecting to ${finalPath}`);
      navigate({ to: finalPath });
    }
  }, [session, user, redirectTo, navigate]);

  if (session && user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p>Redirecting to your dashboard...</p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <section className="flex justify-center items-center h-screen">
      <div className="max-w-xs mx-auto size-full flex flex-col items-center h-full justify-center">
        <div className="flex flex-col text-center w-full">
          <div style={{ opacity: 1, willChange: "auto", transform: "none" }}>
            <div className="flex justify-center items-center">
              <Link to="/" className="flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">NH</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
            <h1 className="text-2xl text-center mt-4">{title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </section>
  );
};
