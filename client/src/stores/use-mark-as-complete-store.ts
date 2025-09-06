import { create } from "zustand";

interface MarkAsCompleteStore {
  isOpen: boolean;
  appointmentId: string | null;
  onOpen: (appointmentId: string) => void;
  onClose: () => void;
}

export const useMarkAsCompleteStore = create<MarkAsCompleteStore>((set) => ({
  isOpen: false,
  appointmentId: null,
  onOpen: (appointmentId) => set({ isOpen: true, appointmentId }),
  onClose: () => set({ isOpen: false, appointmentId: null }),
}));
