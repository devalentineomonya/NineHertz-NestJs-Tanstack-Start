import { create } from 'zustand';

type AddDoctorStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useAddDoctorStore = create<AddDoctorStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
