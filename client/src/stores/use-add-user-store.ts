import { create } from "zustand";
interface AddUser {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useAddUserStore = create<AddUser>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
