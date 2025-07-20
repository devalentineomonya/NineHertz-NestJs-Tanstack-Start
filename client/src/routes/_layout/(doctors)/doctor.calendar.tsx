import { Calendar } from "@/components/ui/calendar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(doctors)/doctor/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Calendar />;
}
