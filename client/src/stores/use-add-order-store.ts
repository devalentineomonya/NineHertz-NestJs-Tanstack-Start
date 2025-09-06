import { create } from 'zustand';

type AddOrderStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useAddOrderStore = create<AddOrderStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
