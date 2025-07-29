import { AppSidebar } from "@/components/shared/sidebar/app-sidebar";
import { SiteHeader } from "@/components/shared/sidebar/site-header";
import ChatBot from "@/components/ui/chatbot";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SheetProvider } from "@/providers/sheet-provider";
import { useUserSessionStore } from "@/stores/user-session-store";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, getCurrentUser } = useUserSessionStore();
  const router = useRouter();
  const currentUser = getCurrentUser();

  useEffect(() => {
    // First check if user is authenticated
    if (!session) {
      router.navigate({
        to: "/auth/signin",
        search: {
          redirect: router.state.location.href,
        },
      });
      return;
    }

    // Then check if user has completed their profile
    if (currentUser && !currentUser.hasProfile) {
      // Redirect to settings page based on user role
      const settingsPath = `/${currentUser.role}/settings`;

      // Only redirect if not already on the settings page
      if (router.state.location.pathname !== settingsPath) {
        router.navigate({
          to: settingsPath,
        });
      }
    }
  }, [session, currentUser, router]);

  // Show nothing while redirecting
  if (
    !session ||
    (currentUser &&
      !currentUser.hasProfile &&
      router.state.location.pathname !== `/${currentUser.role}/settings`)
  ) {
    return null;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="px-4 mt-11 flex flex-1 flex-col">
          <Outlet />
        </main>
      </SidebarInset>
      <SheetProvider />
      <ChatBot position="bottom-right" />
    </SidebarProvider>
  );
}
