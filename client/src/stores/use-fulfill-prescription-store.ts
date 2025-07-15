import { create } from "zustand";

interface FulfillPrescriptionStore {
  isOpen: boolean;
  prescriptionId: string | null;
  onOpen: (prescriptionId: string) => void;
  onClose: () => void;
}

export const useFulfillPrescriptionStore = create<FulfillPrescriptionStore>(
  (set) => ({
    isOpen: false,
    prescriptionId: null,
    onOpen: (prescriptionId) => set({ isOpen: true, prescriptionId }),
    onClose: () => set({ isOpen: false, prescriptionId: null }),
  })
);
