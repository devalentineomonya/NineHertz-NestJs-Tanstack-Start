import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface MessageInputProps {
  placeholder?: string;
  onSend: (content: string) => void;
  isMobile?: boolean;
  onVoiceMessage?: () => void; // Optional voice message functionality
}

export function MessageInput({
  onSend,
  placeholder,
  isMobile = false,
  onVoiceMessage,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isTouchDevice = useMediaQuery("(hover: none)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSend(message.trim());
    setMessage("");
    // Keep focus on input after sending
    inputRef.current?.focus();
  };

  // Handle Enter key for submission (but allow Shift+Enter for new lines)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isTouchDevice) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize input on mobile when keyboard appears
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      if (inputRef.current) {
        // Add any mobile-specific resize logic here
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "border-t p-2 md:p-4 flex gap-2 items-center",
        "bg-background",
        isMobile && "pb-4" // Extra padding on mobile for iOS safe area
      )}
    >
      {/* Voice message button - only shown on mobile when provided */}
      {isMobile && onVoiceMessage && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onVoiceMessage}
          className="rounded-full"
        >
          <Mic className="size-5" />
        </Button>
      )}

      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Type a message..."}
        className={cn(
          "rounded-full flex-1",
          "focus-visible:ring-2 focus-visible:ring-primary",
          isMobile && "text-base" // Slightly larger text on mobile
        )}
        aria-label="Message input"
      />

      <Button
        type="submit"
        disabled={!message.trim()}
        className={cn(
          "rounded-full",
          isMobile ? "size-10" : "size-11" // Slightly smaller on mobile
        )}
        aria-label="Send message"
      >
        <Send className="size-4 md:size-5" />
      </Button>
    </form>
  );
}
