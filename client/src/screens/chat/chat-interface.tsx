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

export function ChatInterface() {
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const { getCurrentUser } = useUserSessionStore();
  const currentUserId = getCurrentUser()?.id;
  const [searchQuery, setSearchQuery] = useState("");

  const { data: chats } = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: async (): Promise<Chat[]> => {
      if (!currentUserId) return [];

      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((chat) => ({
        ...chat,
        participants: chat.participants || [],
        unread_count: chat.unread_count || 0,
      }));
    },
    enabled: !!currentUserId,
  });

  // Fetch participants for all chats
  const { data: participants } = useQuery<ChatParticipant[]>({
    queryKey: ["chat_participants"],
    queryFn: async (): Promise<ChatParticipant[]> => {
      // if (!chats) return [];

      // const chatIds = chats.map((chat) => chat.id);
      const { data, error } = await supabase
        .from("chat_participants")
        .select("chat_id, user_id, user(id, email)");
      // .in("chat_id", chatIds);

      if (error) throw error;
      return (data || []).map((participant) => ({
        chat_id: participant.chat_id,
        user_id: participant.user_id,
        user: {
          id: "participant.user.id",
          email: "participant.user.email",
        },
      }));
    },
    // enabled: !!chats?.length,
  });

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
        () => {
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const filteredChats = chats?.filter((chat) => {
    if (!searchQuery) return true;

    const chatParticipants =
      participants?.filter((p) => p.chat_id === chat.id) || [];
    const otherParticipants = chatParticipants
      .filter((p) => p.user_id !== currentUserId)
      .map((p) => p.user.email);

    return otherParticipants.some((name) =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex h-[calc(100vh-7.8rem)] w-full">
      <Card className="flex flex-col gap-6 rounded-xl border py-6 w-full pb-0 max-w-96">
        <CardHeader className="px-6">
          <div className="flex justify-between items-center">
            <CardTitle>Chats</CardTitle>
            <Button variant="outline" size="icon">
              <PlusSquare className="size-4" />
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4" />
            <Input
              placeholder="Search chats..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto  p-0">
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
                onSelect={() => setSelectedChat(chat.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grow">
        {selectedChat && currentUserId ? (
          <ChatArea chatId={selectedChat} />
        ) : (
          <Placeholder />
        )}
      </div>
    </div>
  );
}
