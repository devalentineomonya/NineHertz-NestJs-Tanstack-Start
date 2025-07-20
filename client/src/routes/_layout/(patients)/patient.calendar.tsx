import { PatientScheduler } from "@/screens/patient/dashboard-calendar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(patients)/patient/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PatientScheduler />;
}
