import { create } from 'zustand';

type AddPharmacyStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useAddPharmacyStore = create<AddPharmacyStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
