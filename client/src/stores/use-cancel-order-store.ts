import { create } from 'zustand';

type CancelOrderStore = {
  isOpen: boolean;
  orderId?: string;
  onOpen: (orderId: string) => void;
  onClose: () => void;
};

export const useCancelOrderStore = create<CancelOrderStore>((set) => ({
  isOpen: false,
  orderId: undefined,
  onOpen: (orderId) => set({ isOpen: true, orderId }),
  onClose: () => set({ isOpen: false, orderId: undefined }),
}));
