import { AdminPharmacy } from "@/screens/admin/pharmacy/pharmacy-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/pharmacy")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminPharmacy />;
}
