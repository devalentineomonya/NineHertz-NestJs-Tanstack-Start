import { create } from "zustand";

interface ReviewStore {
  isOpen: boolean;
  onOpen: (appointmentId: string) => void;
  onClose: () => void;
  appointmentId: string | null;
}

export const useReviewStore = create<ReviewStore>((set) => ({
  isOpen: false,
  appointmentId: null,
  onOpen: (appointmentId) => set({ isOpen: true, appointmentId }),
  onClose: () => set({ isOpen: false, appointmentId: null }),
}));
