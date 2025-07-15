import { PatientScheduler } from "@/screens/patient/dashboard-calendar";
import { PatientDashboardStats } from "@/screens/patient/dashboard-stat-cards";
import { PatientActivityTable } from "@/screens/patient/dashboard-upcoming";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(patients)/patient/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <PatientDashboardStats />
      <PatientActivityTable />
      <PatientScheduler />
    </>
  );
}
