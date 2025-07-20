interface User {
  id: string;
  email: string;
}

interface Chat {
  id: string;
  created_at: string;
  participants: string[];
  last_message?: string;
  unread_count: number;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_optimistic?: boolean;
}

interface ChatParticipant {
  chat_id: string;
  user_id: string;
  user: User;
}
