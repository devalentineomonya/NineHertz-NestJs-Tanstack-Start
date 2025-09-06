import { create } from "zustand";

interface ViewPrescriptionStore {
  isOpen: boolean;
  prescription: PrescriptionResponseDto | null;
  id: string | null;
  onOpen: (id: string, prescription: PrescriptionResponseDto) => void;
  onClose: () => void;
}

export const useViewPrescriptionStore = create<ViewPrescriptionStore>(
  (set) => ({
    isOpen: false,
    prescription: null,
    id: null,
    onOpen: (id, prescription) => set({ isOpen: true, id, prescription }),
    onClose: () => set({ isOpen: false, id: null, prescription: null }),
  })
);
