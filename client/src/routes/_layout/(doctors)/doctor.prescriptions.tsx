import { PrescriptionsTable } from "@/screens/admin/prescriptions/prescriptions-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(doctors)/doctor/prescriptions")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  return <PrescriptionsTable />;
}
