import { PatientsTable } from "@/screens/admin/patients/patients-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/patients")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PatientsTable />;
}
