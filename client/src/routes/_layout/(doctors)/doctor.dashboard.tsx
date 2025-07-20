import { StatsCards } from "@/screens/doctor/doctor-stats-cards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(doctors)/doctor/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <StatsCards />;
}
