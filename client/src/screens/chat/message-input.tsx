import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useState } from "react";

export function MessageInput({
  onSend,
}: {
  onSend: (content: string) => void;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSend(message.trim());
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="rounded-full"
      />
      <Button type="submit" disabled={!message.trim()} className="rounded-full">
        <Send className="size-4" />
      </Button>
    </form>
  );
}
