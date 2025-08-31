import { AdminUsers } from "@/screens/users/users-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/users")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminUsers />;
}
