import { ConsultationsTable } from "@/screens/consultations/consultations-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_layout/(patients)/patient/consultations"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ConsultationsTable />;
}
