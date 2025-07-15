import { create } from "zustand";

interface SendReminderStore {
  isOpen: boolean;
  appointmentId: string | null;
  onOpen: (appointmentId: string) => void;
  onClose: () => void;
}

export const useSendReminderStore = create<SendReminderStore>((set) => ({
  isOpen: false,
  appointmentId: null,
  onOpen: (appointmentId) => set({ isOpen: true, appointmentId }),
  onClose: () => set({ isOpen: false, appointmentId: null }),
}));
