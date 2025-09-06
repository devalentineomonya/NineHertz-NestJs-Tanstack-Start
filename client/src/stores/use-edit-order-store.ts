import { create } from 'zustand';

interface EditOrderState {
  isOpen: boolean;
  orderId: string | null;
  onOpen: (orderId: string) => void;
  onClose: () => void;
}

export const useEditOrderStore = create<EditOrderState>((set) => ({
  isOpen: false,
  orderId: null,
  onOpen: (orderId: string) => set({ isOpen: true, orderId }),
  onClose: () => set({ isOpen: false, orderId: null }),
}));
