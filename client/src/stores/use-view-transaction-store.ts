import { create } from "zustand";

interface ViewTransaction {
  isOpen: boolean;
  id: string | null;
  onOpen: (id: string, transaction: TransactionResponseDto) => void;
  onClose: () => void;
  transaction: TransactionResponseDto | null;
}

export const useViewTransactionStore = create<ViewTransaction>((set) => ({
  isOpen: false,
  id: null,
  transaction: null,
  onOpen: (id, transaction) => set({ isOpen: true, id, transaction }),
  onClose: () => set({ isOpen: false, id: null, transaction: null }),
}));
