import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/shared/sidebar/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/shared/sidebar/site-header";
import { SheetProvider } from "@/providers/sheet-provider";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
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
