import { create } from 'zustand';

type AddAdminStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useAddAdminStore = create<AddAdminStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
