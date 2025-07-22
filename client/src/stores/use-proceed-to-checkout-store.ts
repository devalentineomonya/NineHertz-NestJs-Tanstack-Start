import { create } from 'zustand';

interface ProceedToCheckoutState {
  isOpen: boolean;
  orderData: OrderResponseDto | null;
  open: (orderData: OrderResponseDto) => void;
  onClose: () => void;
}

export const useProceedToCheckoutStore = create<ProceedToCheckoutState>((set) => ({
  isOpen: false,
  orderData: null,
  open: (orderData) => set({ isOpen: true, orderData }),
  onClose: () => set({ isOpen: false, orderData: null }),
}));
