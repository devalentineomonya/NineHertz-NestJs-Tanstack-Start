import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showHeader: boolean;
  isOptimistic?: boolean;
}

export function ChatMessageBubble({
  message,
  isOwnMessage,
  showHeader,
  isOptimistic,
}: ChatMessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] w-fit flex flex-col gap-1 ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        {showHeader && isOwnMessage && (
          <div className="flex items-center gap-2 text-xs px-2">
            <span className="font-medium">You</span>
            <span className="text-foreground/50 text-xs">
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
        <div
          className={cn(
            "py-2 px-3 rounded-xl text-sm w-fit",
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-muted text-foreground rounded-bl-none",
            isOptimistic && "opacity-70"
          )}
        >
          {message.content}
          <div
            className={`text-xs mt-1 flex ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={
                isOwnMessage
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }
            >
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
