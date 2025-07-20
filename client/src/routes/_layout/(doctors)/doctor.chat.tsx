import { ChatInterface } from "@/screens/chat/chat-interface";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(doctors)/doctor/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChatInterface />;
}
