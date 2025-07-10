import { create } from 'zustand';

type AddConsultationStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useAddConsultationStore = create<AddConsultationStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
