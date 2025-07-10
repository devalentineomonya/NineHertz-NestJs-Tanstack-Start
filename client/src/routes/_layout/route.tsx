import { AppSidebar } from "@/components/shared/sidebar/app-sidebar";
import { SiteHeader } from "@/components/shared/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SheetProvider } from "@/providers/sheet-provider";
import { useUserSessionStore } from "@/stores/user-session-store";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useUserSessionStore();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.navigate({
        to: "/auth/signin",
        search: {
          redirect: router.state.location.href,
        },
      });
    }
  }, [session, router]);

  if (!session) {
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
    </SidebarProvider>
  );
}
