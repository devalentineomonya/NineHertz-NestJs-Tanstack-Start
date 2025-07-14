import { create } from "zustand";
interface AddPrescription {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useAddPrescriptionStore = create<AddPrescription>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
