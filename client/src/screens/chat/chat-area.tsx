import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessageBubble } from "./chat-message-button";
import { MessageInput } from "./message-input";
import { Badge } from "@/components/ui/badge";
import { Video, Phone, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface EnhancedMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_by: string[];
  message_type: "text" | "system" | "appointment_reminder";
  is_optimistic?: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  role: "patient" | "doctor" | "admin" | "pharmacist";
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

interface ChatAreaProps {
  chatId: string;
  currentUserProfile?: UserProfile;
  participants: ChatParticipant[];
  getDisplayName: (user: UserProfile) => string;
  onBack?: () => void;
}

export function ChatArea({
  chatId,
  currentUserProfile,
  participants,
  getDisplayName,
  onBack,
}: ChatAreaProps) {
  const queryClient = useQueryClient();
  const { containerRef, scrollToBottom } = useChatScroll();
  const isMobile = useIsMobile();
  // Get the other participant (not current user)
  const otherParticipant = participants.find(
    (p) => p.user_id !== currentUserProfile?.id
  );

  const { data: messages = [] } = useQuery<EnhancedMessage[]>({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []).map((msg) => ({
        ...msg,
        read_by: msg.read_by || [],
      }));
    },
  });

  // Fetch chat details including appointment info
  const { data: chatDetails } = useQuery({
    queryKey: ["chat_details", chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*, appointment_id")
        .eq("id", chatId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription for messages
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-messages-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Mark messages as read when viewing
  useEffect(() => {
    const markAsRead = async () => {
      if (!currentUserProfile?.id || messages.length === 0) return;

      const unreadMessages = messages.filter(
        (msg) =>
          !msg.read_by.includes(currentUserProfile.id) &&
          msg.sender_id !== currentUserProfile.id
      );

      if (unreadMessages.length > 0) {
        try {
          await Promise.all(
            unreadMessages.map((msg) =>
              supabase.rpc("append_to_read_by", {
                msg_id: msg.id,
                reader_id: currentUserProfile.id,
              })
            )
          );
        } catch (error) {
          console.error("Failed to mark messages as read:", error);
        }
      }
    };

    markAsRead();
  }, [messages, currentUserProfile?.id]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentUserProfile) return;

    const optimisticMessage: EnhancedMessage = {
      id: `optimistic-${Date.now()}`,
      chat_id: chatId,
      sender_id: currentUserProfile.id,
      content,
      created_at: new Date().toISOString(),
      read_by: [currentUserProfile.id],
      message_type: "text",
      is_optimistic: true,
    };

    // Optimistically update the UI
    queryClient.setQueryData<EnhancedMessage[]>(
      ["messages", chatId],
      (old = []) => [...old, optimisticMessage]
    );

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          sender_id: currentUserProfile.id,
          content,
          message_type: "text",
          read_by: [currentUserProfile.id],
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      queryClient.setQueryData<EnhancedMessage[]>(
        ["messages", chatId],
        (old = []) =>
          old.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...data, read_by: data.read_by || [currentUserProfile.id] }
              : msg
          )
      );

      // Update chat's last message
      await supabase
        .from("chats")
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", chatId);
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      queryClient.setQueryData<EnhancedMessage[]>(
        ["messages", chatId],
        (old = []) => old.filter((msg) => msg.id !== optimisticMessage.id)
      );
    }
  };

  const getUserRole = (userId: string): string => {
    const participant = participants.find((p) => p.user_id === userId);
    return participant?.user.role || "user";
  };

  const getAvatarUrl = (user: UserProfile): string => {
    return user.profilePicture || `https://avatar.vercel.sh/${user.email}`;
  };

  const isOnline = (userId: string): boolean => {
    // You can implement online status logic here
    // For now, returning true for demonstration
    return true;
  };

  if (!otherParticipant) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load chat participant</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with back button and participant info */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className={isMobile ? "flex md:hidden" : "hidden"}
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Avatar className="size-10 overflow-visible">
            <AvatarImage
              className="rounded-lg"
              src={getAvatarUrl(otherParticipant.user)}
              alt={getDisplayName(otherParticipant.user)}
            />
            <AvatarFallback className="rounded-lg uppercase">
              {getDisplayName(otherParticipant.user)[0]}
            </AvatarFallback>
            {isOnline(otherParticipant.user_id) && (
              <span className="size-3 absolute rounded-full bg-green-400 -end-0.5 -bottom-0.5" />
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {getDisplayName(otherParticipant.user)}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {otherParticipant.user.role}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {isOnline(otherParticipant.user_id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action buttons - hide on small screens if not appointment */}
        <div className="flex items-center gap-2">
          {chatDetails?.appointment_id && (
            <>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Video className="size-4 mr-2" />
                <span className="hidden md:inline">Video Call</span>
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Calendar className="size-4 mr-2" />
                <span className="hidden md:inline">Appointment</span>
              </Button>
            </>
          )}
          {isMobile && (
            <Button variant="outline" size="icon">
              <Phone className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-auto p-4 md:pr-0 flex flex-col gap-4 chat-area"
        ref={containerRef}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <p className="text-muted-foreground mb-2">
                Start your conversation with{" "}
                {getDisplayName(otherParticipant.user)}
              </p>
              {chatDetails?.appointment_id && (
                <Badge variant="outline">Appointment Chat</Badge>
              )}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender_id === currentUserProfile?.id}
              showHeader={
                index === 0 ||
                messages[index - 1]?.sender_id !== message.sender_id ||
                new Date(message.created_at).getTime() -
                  new Date(messages[index - 1]?.created_at).getTime() >
                  5 * 60 * 1000
              }
              isOptimistic={message.is_optimistic}
              sender={
                participants.find((p) => p.user_id === message.sender_id)?.user
              }
              getDisplayName={getDisplayName}
              currentUserId={currentUserProfile?.id}
              isMobile={isMobile}
            />
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <MessageInput
          onSend={handleSendMessage}
          placeholder={`Message ${getDisplayName(otherParticipant.user)}...`}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
