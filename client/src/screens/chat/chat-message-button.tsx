import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCheck, Clock } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'pharmacist';
  profilePicture?: string;
  patientProfile?: {
    id: string;
    fullName: string;
    phoneNumber?: string;
  };
  doctorProfile?: {
    id: string;
    fullName: string;
    specialization?: string;
    phoneNumber?: string;
  };
  adminProfile?: {
    id: string;
    fullName: string;
  };
  pharmacistProfile?: {
    id: string;
    fullName: string;
  };
}

interface EnhancedMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_by: string[];
  message_type: 'text' | 'system' | 'appointment_reminder';
  is_optimistic?: boolean;
}

interface ChatMessageBubbleProps {
  message: EnhancedMessage;
  isOwnMessage: boolean;
  showHeader: boolean;
  isOptimistic?: boolean;
  sender?: UserProfile;
  getDisplayName: (user: UserProfile) => string;
  currentUserId?: string;
  isMobile?: boolean;
}

export function ChatMessageBubble({
  message,
  isOwnMessage,
  showHeader,
  isOptimistic,
  sender,
  getDisplayName,
  currentUserId,
  isMobile = false,
}: ChatMessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReadStatus = () => {
    if (isOptimistic) return <Clock className="size-3" />;
    if (!isOwnMessage) return null;

    const readByOthers = message.read_by.filter(id => id !== currentUserId);
    return readByOthers.length > 0 ?
      <CheckCheck className="size-3 text-blue-500" /> :
      <Check className="size-3 text-muted-foreground" />;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'text-blue-600';
      case 'patient':
        return 'text-green-600';
      case 'admin':
        return 'text-purple-600';
      case 'pharmacist':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAvatarUrl = (user: UserProfile) => {
    return user.profilePicture || `https://avatar.vercel.sh/${user.email}`;
  };

  // Handle system messages
  if (message.message_type === 'system' || message.message_type === 'appointment_reminder') {
    return (
      <div className="flex justify-center my-2 md:my-4">
        <div className="bg-muted px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm text-muted-foreground max-w-[90%] md:max-w-xs text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-1.5 md:gap-3 ${isOwnMessage ? "justify-end" : "justify-start"} px-2 md:px-0`}>
      {/* Avatar for other user's messages - hidden on mobile except for first message */}
      {!isOwnMessage && showHeader && sender && (
        <Avatar className={cn(
          "size-7 md:size-8",
          isMobile && !showHeader && "hidden"
        )}>
          <AvatarImage
            src={getAvatarUrl(sender)}
            alt={getDisplayName(sender)}
            className="object-cover"
          />
          <AvatarFallback className="text-xs">
            {getDisplayName(sender)[0]}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Spacer for non-header messages - smaller on mobile */}
      {!isOwnMessage && !showHeader && (
        <div className={cn(
          "size-7 md:size-8",
          isMobile && "hidden"
        )} />
      )}

      <div
        className={cn(
          "max-w-[85%] md:max-w-[75%] w-fit flex flex-col gap-0.5 md:gap-1",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        {/* Message header with sender info - simplified on mobile */}
        {showHeader && !isOwnMessage && sender && (
          <div className="flex items-center gap-1 md:gap-2 text-xs px-1 md:px-2">
            {!isMobile && (
              <>
                <span className={`font-medium ${getRoleColor(sender.role)}`}>
                  {getDisplayName(sender)}
                </span>
                <Badge variant="outline" className="text-xs px-1 py-0 hidden md:block">
                  {sender.role}
                </Badge>
              </>
            )}
            <span className="text-muted-foreground text-xs">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        {/* Own message header - simplified on mobile */}
        {showHeader && isOwnMessage && (
          <div className="flex items-center gap-1 md:gap-2 text-xs px-1 md:px-2">
            {!isMobile && <span className="font-medium text-primary">You</span>}
            <span className="text-muted-foreground text-xs">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        {/* Message bubble - adjusted padding for mobile */}
        <div
          className={cn(
            "py-2 px-3 md:py-3 md:px-4 rounded-xl text-sm w-fit relative",
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md",
            isOptimistic && "opacity-70",
            "shadow-sm"
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Message footer with time and read status - simplified on mobile */}
          <div
            className={cn(
              "text-[0.7rem] md:text-xs mt-1 md:mt-2 flex items-center gap-1",
              isOwnMessage ? "justify-end" : "justify-start"
            )}
          >
            {(!isMobile || isOwnMessage) && (
              <>
                <span
                  className={
                    isOwnMessage
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }
                >
                  {formatTime(message.created_at)}
                </span>
                {getReadStatus()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
