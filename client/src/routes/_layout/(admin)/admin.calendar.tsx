import { PatientScheduler } from "@/screens/patient/dashboard-calendar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PatientScheduler />;
}
