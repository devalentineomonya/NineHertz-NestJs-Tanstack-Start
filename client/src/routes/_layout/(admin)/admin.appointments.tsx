import { AdminAppointments } from "@/screens/admin/appointments/appointments-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/appointments")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminAppointments />;
}
