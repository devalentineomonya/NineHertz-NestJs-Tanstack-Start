import { ChatInterface } from "@/screens/chat/chat-interface";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChatInterface />;
}
