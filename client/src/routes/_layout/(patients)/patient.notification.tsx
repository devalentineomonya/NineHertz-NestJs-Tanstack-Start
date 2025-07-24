import NotificationsPage from "@/screens/notifications/notifications-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_layout/(patients)/patient/notification"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <NotificationsPage />;
}
