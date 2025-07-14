import { AdminAdmins } from "@/screens/admin/admin/admin-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/admins")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminAdmins />;
}
