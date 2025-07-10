import { create } from 'zustand';

interface DeleteUserState {
  isOpen: boolean;
  userId: string | null;
  userRole: string | null;
  openModal: (userId: string, userRole: string) => void;
  closeModal: () => void;
}

export const useDeleteUserStore = create<DeleteUserState>((set) => ({
  isOpen: false,
  userId: null,
  userRole: null,
  openModal: (userId, userRole) => set({ isOpen: true, userId, userRole }),
  closeModal: () => set({ isOpen: false, userId: null, userRole: null }),
}));
