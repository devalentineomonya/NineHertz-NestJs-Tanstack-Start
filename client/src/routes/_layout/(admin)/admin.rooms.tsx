import { createFileRoute } from "@tanstack/react-router";
import { RoomsList } from "@/screens/rooms/room-list";

export const Route = createFileRoute("/_layout/(admin)/admin/rooms")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoomsList />;
}
