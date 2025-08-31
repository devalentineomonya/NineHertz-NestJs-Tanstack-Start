import { AdminDoctors } from "@/screens/admin/doctors/doctors-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(patients)/patient/doctors")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminDoctors />;
}
