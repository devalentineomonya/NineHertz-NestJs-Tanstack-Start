import { Settings } from "@/screens/settings/setting";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(doctors)/doctor/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Settings />;
}
