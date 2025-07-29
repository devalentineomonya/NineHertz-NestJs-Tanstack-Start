import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { PlusSquare, Search } from "lucide-react";
import { ChatListItem } from "./chat-list-item";
import { Placeholder } from "./chat-placeholder";
import { ChatArea } from "./chat-area";
import { useUserSessionStore } from "@/stores/user-session-store";
import { dataServices } from "@/services/data/data-service";
import { useIsMobile } from "@/hooks/use-mobile";

// Enhanced types to match your backend structure
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

interface EnhancedChat {
  id: string;
  appointment_id?: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
  participants: string[];
  unread_count: number;
  type: "appointment" | "general";
}

interface ChatParticipant {
  chat_id: string;
  user_id: string;
  joined_at: string;
  user: UserProfile;
}

// API service for NestJS integration
class ChatAPIService {
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await dataServices.api.messaging
      ._user_profile(userId)
      .get.call();
    return response.data;
  }

  async createChatForAppointment(appointmentId: string): Promise<string> {
    const response = await dataServices.api.messaging.appointment.post.call({
      json: { appointmentId },
    });
    const data = response.data;
    return data.chatId;
  }

  async markMessagesAsRead(chatId: string): Promise<void> {
    await dataServices.api.messaging._chatId_mark_read(chatId).post.call();
  }
}

export function ChatInterface() {
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const { getCurrentUser } = useUserSessionStore();
  const currentUserId = getCurrentUser()?.id;
  const [searchQuery, setSearchQuery] = useState("");
  const chatAPI = new ChatAPIService();
  const isMobile = useIsMobile();
  const [showChatList, setShowChatList] = useState(true);

  // Fetch current user's profile with relations
  const { data: currentUserProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile", currentUserId],
    queryFn: () => chatAPI.getUserProfile(currentUserId!),
    enabled: !!currentUserId,
  });

  // Fetch chats from Supabase
  const { data: chats } = useQuery<EnhancedChat[]>({
    queryKey: ["chats", currentUserId],
    queryFn: async (): Promise<EnhancedChat[]> => {
      if (!currentUserId) return [];

      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .contains("participants", [currentUserId])
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((chat) => ({
        ...chat,
        participants: chat.participants || [],
        unread_count: chat.unread_count || 0,
        type: chat.appointment_id ? "appointment" : "general",
      }));
    },
    enabled: !!currentUserId,
  });

  // Fetch participants with full user profiles
  const { data: participants } = useQuery<ChatParticipant[]>({
    queryKey: ["chat_participants", chats],
    queryFn: async (): Promise<ChatParticipant[]> => {
      if (!chats?.length) return [];

      const chatIds = chats.map((chat) => chat.id);
      const { data, error } = await supabase
        .from("chat_participants")
        .select("chat_id, user_id, joined_at")
        .in("chat_id", chatIds);

      if (error) throw error;

      // Fetch user profiles from your NestJS backend
      const userIds = [...new Set(data?.map((p) => p.user_id) || [])];
      const userProfiles = await Promise.all(
        userIds.map(async (userId) => {
          try {
            return await chatAPI.getUserProfile(userId);
          } catch (error) {
            console.error(`Failed to fetch profile for user ${userId}:`, error);
            return null;
          }
        })
      );

      const userProfileMap = new Map(
        userProfiles.filter(Boolean).map((profile) => [profile!.id, profile!])
      );

      return (data || []).map((participant) => ({
        chat_id: participant.chat_id,
        user_id: participant.user_id,
        joined_at: participant.joined_at,
        user: userProfileMap.get(participant.user_id) || {
          id: participant.user_id,
          email: "Unknown User",
          role: "patient" as const,
        },
      }));
    },
    enabled: !!chats?.length,
  });

  // Real-time subscription for chats
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("realtime-chats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
          filter: `participants=cs.{${currentUserId}}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["chats", currentUserId] });

          // If it's a new message, update unread count
          if (payload.eventType === "UPDATE" && payload.new.last_message_at) {
            queryClient.invalidateQueries({ queryKey: ["chat_participants"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);

  // Mark chat as read when selected
  const handleChatSelect = async (chatId: string) => {
    setSelectedChat(chatId);
    if (isMobile) setShowChatList(false);

    try {
      await chatAPI.markMessagesAsRead(chatId);

      // Update local state immediately
      queryClient.setQueryData<EnhancedChat[]>(
        ["chats", currentUserId],
        (oldChats) =>
          oldChats?.map((chat) =>
            chat.id === chatId ? { ...chat, unread_count: 0 } : chat
          ) || []
      );
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  // Helper function to get display name for a user
  const getDisplayName = (user: UserProfile): string => {
    switch (user.role) {
      case "patient":
        return user.patientProfile?.fullName || user.email;
      case "doctor":
        return `Dr. ${user.doctorProfile?.fullName || user.email}`;
      case "admin":
        return user.adminProfile?.fullName || user.email;
      case "pharmacist":
        return user.pharmacistProfile?.fullName || user.email;
      default:
        return user.email;
    }
  };

  // Filter chats based on search query
  const filteredChats = chats?.filter((chat) => {
    if (!searchQuery) return true;

    const chatParticipants =
      participants?.filter((p) => p.chat_id === chat.id) || [];
    const otherParticipants = chatParticipants.filter(
      (p) => p.user_id !== currentUserId
    );

    return otherParticipants.some((participant) => {
      const displayName = getDisplayName(participant.user);
      return (
        displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  });
  return (
    <div className="flex h-[calc(100vh-7.8rem)] w-full">
      {/* Chat List - Conditionally shown on mobile */}
      {(!isMobile || showChatList) && (
        <Card
          className={`flex flex-col gap-6 rounded-xl border py-6 w-full pb-0 ${
            !isMobile ? "max-w-96" : ""
          }`}
        >
          <CardHeader className="px-6">
            <div className="flex justify-between items-center">
              <CardTitle>
                {currentUserProfile?.role === "patient"
                  ? "My Doctors"
                  : "My Patients"}
              </CardTitle>
              <Button variant="outline" size="icon">
                <PlusSquare className="size-4" />
              </Button>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto p-0">
            <div className="divide-y">
              {filteredChats?.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  participants={
                    participants?.filter((p) => p.chat_id === chat.id) || []
                  }
                  currentUserId={currentUserId}
                  isSelected={selectedChat === chat.id}
                  onSelect={() => handleChatSelect(chat.id)}
                  getDisplayName={getDisplayName}
                />
              ))}
              {filteredChats?.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  {searchQuery
                    ? "No conversations found"
                    : "No conversations yet"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Area - Conditionally shown on mobile */}
      {(!isMobile || !showChatList) && (
        <div className="grow">
          {selectedChat && currentUserId ? (
            <ChatArea
              chatId={selectedChat}
              currentUserProfile={currentUserProfile}
              participants={
                participants?.filter((p) => p.chat_id === selectedChat) || []
              }
              getDisplayName={getDisplayName}
              // Add back button for mobile
              onBack={() => isMobile && setShowChatList(true)}
            />
          ) : !isMobile ? ( // Only show placeholder on desktop
            <Placeholder />
          ) : null}
        </div>
      )}
    </div>
  );
}
