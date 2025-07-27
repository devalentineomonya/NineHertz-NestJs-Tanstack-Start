import { RoomsList } from "@/screens/rooms/room-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(doctors)/doctor/rooms")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoomsList />;
}
