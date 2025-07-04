import { AdminConsultations } from "@/screens/admin/consultations/consultations-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/consultations")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminConsultations />;
}
