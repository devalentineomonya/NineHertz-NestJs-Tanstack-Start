import { create } from 'zustand';

type AddPatientStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useAddPatientStore = create<AddPatientStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
