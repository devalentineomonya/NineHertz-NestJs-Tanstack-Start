import { create } from 'zustand';

interface ViewOrderState {
  isOpen: boolean;
  order: OrderResponseDto | null;
  onOpen: (order: OrderResponseDto) => void;
  onClose: () => void;
}

export const useViewOrderStore = create<ViewOrderState>((set) => ({
  isOpen: false,
  order: null,
  onOpen: (order) => set({ isOpen: true, order }),
  onClose: () => set({ isOpen: false, order: null }),
}));
