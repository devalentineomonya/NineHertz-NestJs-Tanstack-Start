import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessageBubble } from "./chat-message-button";
import { MessageInput } from "./message-input";
import { useUserSessionStore } from "@/stores/user-session-store";

export function ChatArea({ chatId }: { chatId: string }) {
  const queryClient = useQueryClient();
  const { containerRef, scrollToBottom } = useChatScroll();
  const { getCurrentUser } = useUserSessionStore();
  const recipient = getCurrentUser();
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

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
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      chat_id: chatId,
      sender_id: recipient?.id || "",
      content,
      created_at: new Date().toISOString(),
      is_optimistic: true,
    };

    queryClient.setQueryData<Message[]>(["messages", chatId], (old = []) => [
      ...old,
      optimisticMessage,
    ]);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          sender_id: recipient?.id || "",
          content,
        })
        .select();

      if (error) throw error;
      if (data?.[0]) {
        queryClient.setQueryData<Message[]>(["messages", chatId], (old = []) =>
          old.map((msg) => (msg.id === optimisticMessage.id ? data[0] : msg))
        );
        await supabase
          .from("chats")
          .update({ last_message: content })
          .eq("id", chatId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      queryClient.setQueryData<Message[]>(["messages", chatId], (old = []) =>
        old.filter((msg) => msg.id !== optimisticMessage.id)
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {recipient && (
        <div className="border-b pb-2 pl-2 ">
          <div className="flex items-center gap-3">
            <Avatar className="size- overflow-visible">
              <AvatarImage
                className="rounded-lg"
                src={`https://avatar.vercel.sh/${recipient.email}`}
                alt={recipient.email}
              />
              <AvatarFallback className="rounded-lg uppercase">
                {recipient.email[0]}
              </AvatarFallback>
              <span className="size-2 absolute rounded-full bg-green-400 -end-0.5 -bottom-0.5" />
            </Avatar>
            <div>
              <h3 className="font-semibold">{recipient.email}</h3>
              <p className="text-muted-foreground text-sm">Online</p>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="flex-1 overflow-auto p-4 pr-0 flex flex-col gap-4 chat-area"
        ref={containerRef}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const sameSender = prevMessage?.sender_id === message.sender_id;
            const timeDiff = prevMessage
              ? new Date(message.created_at).getTime() -
                new Date(prevMessage.created_at).getTime()
              : Infinity;

            const showHeader = !sameSender || timeDiff > 5 * 60 * 1000;

            return (
              <ChatMessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === recipient?.id}
                showHeader={showHeader}
                isOptimistic={message.is_optimistic}
              />
            );
          })
        )}
      </div>

      {/* Message input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
