/// <reference types="vite/client" />
import { NotFound } from "@/components/common/not-found";
import { DefaultCatchBoundary } from "@/components/common/try-catch-boundary";
import FooterSection from "@/components/shared/footer/footer";
import Navbar from "@/components/shared/navbar/navbar";
import { Toaster } from "@/components/ui/sonner";
import { seo } from "@/utils/seo";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/react";
import * as React from "react";
import appCss from "../styles/index.css?url";
// import "react-big-calendar/lib/sass/styles";
import { InstallPWAButton } from "@/components/common/install-pwa-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOffline } from "@/hooks/use-is-offline";
import { PusherProvider } from "@/providers/pusher-provider";
import { useUserSessionStore } from "@/stores/user-session-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { WifiOff } from "lucide-react";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "Custom Healthcare App Development Services",
        description: `Streamline healthcare operations with custom app development services. Key modules include doctor appointment solutions, pharmacy app development, and telemedicine.`,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/pwa-192x192.png", sizes: "192x192" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  const isOffline = useOffline();
  const { getCurrentUser } = useUserSessionStore();
  const user = getCurrentUser();
  // React.useEffect(() => {
  //   if ("serviceWorker" in navigator && import.meta.env.PROD) {
  //     navigator.serviceWorker
  //       .register("/sw.js")
  //       .then((reg) => {
  //         console.log("Service Worker registered: ", reg);
  //         if (!navigator.serviceWorker.controller) {
  //           window.location.reload();
  //         }
  //       })
  //       .catch((error) => {
  //         console.log("Service Worker registration failed: ", error);
  //       });
  //   }
  // }, []);

  const showOfflineAlert =
    isOffline && (import.meta.env.PROD || !navigator.onLine);

  return (
    <html className="scroll-smooth scroll-">
      <head>
        <HeadContent />
      </head>
      <body>
        <PusherProvider userId={user?.id || ""}>
          <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
              {showOfflineAlert && (
                <div className="fixed top-0 left-0 right-0 z-50">
                  <Alert
                    variant="destructive"
                    className="rounded-none border-x-0 border-t-0"
                  >
                    <WifiOff className="h-4 w-4" />
                    <AlertTitle>Offline Mode</AlertTitle>
                    <AlertDescription>
                      You're currently offline. App functionality may be
                      limited.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <Navbar />
              <div className={showOfflineAlert ? "mt-12" : ""}>{children}</div>
              <FooterSection />
              <InstallPWAButton />
              <Toaster richColors position="top-center" />
              <Scripts />
              <Analytics />
            </NuqsAdapter>
          </QueryClientProvider>
        </PusherProvider>
      </body>
    </html>
  );
}
