import { create } from "zustand";

interface ViewUser {
  isOpen: boolean;
  id: string | null;
  user: UserResponseDto  | null;
  onOpen: (id: string,user:UserResponseDto) => void;
  onClose: () => void;
}

export const useViewUser = create<ViewUser>((set) => ({
  isOpen: false,
  id: null,
  user: null,
  onOpen: (id, user) => set({ isOpen: true, id, user }),
  onClose: () => set({ isOpen: false, id: null, user: null }),
}));
