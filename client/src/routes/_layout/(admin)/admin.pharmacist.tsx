import { AdminPharmacist } from "@/screens/admin/pharmacist/pharmacist-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/pharmacist")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminPharmacist />;
}
