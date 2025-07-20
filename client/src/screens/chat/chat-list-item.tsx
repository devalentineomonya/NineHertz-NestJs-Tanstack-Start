import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, CheckCheck, Ellipsis } from "lucide-react";

export function ChatListItem({
  chat,
  participants,
  currentUserId,
  isSelected,
  onSelect,
}: {
  chat: Chat;
  participants: ChatParticipant[];
  currentUserId?: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const otherParticipants = participants
    .filter((p) => p.user_id !== currentUserId)
    .map((p) => p.user);

  const recipient = otherParticipants[0];
  const recipientEmail =
    recipient?.email
  return (
    <div
      className={`group/item hover:bg-muted relative flex min-w-0 cursor-pointer items-center gap-4 pl-3 px-6 py-2 ${
        isSelected ? "bg-muted" : ""
      }`}
      onClick={onSelect}
    >
      <Avatar className="size-10 overflow-visible">
        <AvatarImage className="rounded-lg" src={`https://avatar.vercel.sh/${recipientEmail}`} alt={recipientEmail} />
        <AvatarFallback>{recipientEmail?.[0]}</AvatarFallback>
        <span className="size-3 absolute rounded-full bg-green-400 -end-1 -bottom-1" />
      </Avatar>

      <div className="min-w-0 grow">
        <div className="flex items-center justify-between">
          <span className="truncate font-medium">{recipientEmail}</span>
          <span className="text-muted-foreground text-xs">
            {new Date(chat.created_at).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {chat.unread_count > 0 ? (
            <CheckCheck className="text-green-500 size-4" />
          ) : (
            <Check className="text-muted-foreground size-4" />
          )}
          <span className="text-muted-foreground truncate text-sm">
            {chat.last_message || "No messages yet"}
          </span>
          {chat.unread_count > 0 && (
            <div className="ms-auto flex size-6 items-center justify-center rounded-full bg-green-500 text-xs text-white">
              {chat.unread_count}
            </div>
          )}
        </div>
      </div>

      <div className="absolute end-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-muted from-50% px-4 opacity-0 group-hover/item:opacity-100">
        <Button variant="outline" size="icon">
          <Ellipsis className="size-4" />
        </Button>
      </div>
    </div>
  );
}
