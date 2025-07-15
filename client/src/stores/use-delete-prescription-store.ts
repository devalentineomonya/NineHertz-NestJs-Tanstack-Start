import { create } from "zustand";

interface DeletePrescriptionStore {
  isOpen: boolean;
  prescriptionId: string | null;
  onOpen: (prescriptionId: string) => void;
  onClose: () => void;
}

export const useDeletePrescriptionStore = create<DeletePrescriptionStore>(
  (set) => ({
    isOpen: false,
    prescriptionId: null,
    onOpen: (prescriptionId) => set({ isOpen: true, prescriptionId }),
    onClose: () => set({ isOpen: false, prescriptionId: null }),
  })
);
