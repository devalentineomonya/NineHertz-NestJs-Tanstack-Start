import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCheck, Ellipsis, Calendar, Video } from "lucide-react";

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

interface ChatParticipant {
  chat_id: string;
  user_id: string;
  joined_at: string;
  user: UserProfile;
}

interface EnhancedChat {
  id: string;
  appointment_id?: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
  participants: string[];
  unread_count: number;
  type: 'appointment' | 'general';
}

interface ChatListItemProps {
  chat: EnhancedChat;
  participants: ChatParticipant[];
  currentUserId?: string;
  isSelected: boolean;
  onSelect: () => void;
  getDisplayName: (user: UserProfile) => string;
}

export function ChatListItem({
  chat,
  participants,
  currentUserId,
  isSelected,
  onSelect,
  getDisplayName,
}: ChatListItemProps) {
  const otherParticipants = participants
    .filter((p) => p.user_id !== currentUserId);
console.log(participants)
  const recipient = otherParticipants[0];

  if (!recipient) {
    return null;
  }

  const displayName = getDisplayName(recipient.user);
  const avatarUrl = recipient.user.profilePicture ||
                   `https://avatar.vercel.sh/${recipient.user.email}`;

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], {
        weekday: "short",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'patient':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'pharmacist':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOnline = () => {
    // You can implement online status logic here
    return Math.random() > 0.5; // Random for demo
  };

  return (
    <div
      className={`group/item hover:bg-muted relative flex min-w-0 cursor-pointer items-center gap-4 pl-3 px-6 py-3 transition-colors ${
        isSelected ? "bg-muted" : ""
      }`}
      onClick={onSelect}
    >
      <Avatar className="size-12 overflow-visible">
        <AvatarImage
          className="rounded-lg object-cover"
          src={avatarUrl}
          alt={displayName}
        />
        <AvatarFallback className="rounded-lg uppercase text-sm font-medium">
          {displayName[0]}
        </AvatarFallback>
        {isOnline() && (
          <span className="size-3 absolute rounded-full bg-green-400 border-2 border-white -end-0.5 -bottom-0.5" />
        )}
      </Avatar>

      <div className="min-w-0 grow">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate font-medium text-sm">
              {displayName}
            </span>
            <Badge
              variant="secondary"
              className={`text-xs px-2 py-0.5 ${getRoleColor(recipient.user.role)}`}
            >
              {recipient.user.role}
            </Badge>
            {chat.type === 'appointment' && (
              <Calendar className="size-3 text-blue-500" />
            )}
          </div>
          <span className="text-muted-foreground text-xs whitespace-nowrap ml-2">
            {formatTime(chat.last_message_at || chat.created_at)}
          </span>
        </div>

        {/* Specialization for doctors */}
        {recipient.user.role === 'doctor' &&
         recipient.user.doctorProfile?.specialization && (
          <p className="text-xs text-muted-foreground mb-1 truncate">
            {recipient.user.doctorProfile.specialization}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {chat.unread_count === 0 ? (
              <CheckCheck className="text-green-500 size-3 flex-shrink-0" />
            ) : (
              <Check className="text-muted-foreground size-3 flex-shrink-0" />
            )}
            <span className="text-muted-foreground truncate text-sm">
              {chat.last_message || "No messages yet"}
            </span>
          </div>

          {chat.unread_count > 0 && (
            <div className="ml-2 flex size-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white font-medium">
              {chat.unread_count > 99 ? '99+' : chat.unread_count}
            </div>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute end-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-gradient-to-l from-muted from-70% px-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
        {chat.type === 'appointment' && (
          <Button variant="ghost" size="icon" className="size-8">
            <Video className="size-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="size-8">
          <Ellipsis className="size-4" />
        </Button>
      </div>
    </div>
  );
}
