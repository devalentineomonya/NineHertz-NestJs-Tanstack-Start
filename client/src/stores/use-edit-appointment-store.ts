import { create } from "zustand";

interface EditAppointmentStore {
  isOpen: boolean;
  appointmentId: string | null;
  onOpen: (appointmentId: string) => void;
  onClose: () => void;
}

export const useEditAppointmentStore = create<EditAppointmentStore>((set) => ({
  isOpen: false,
  appointmentId: null,
  onOpen: (appointmentId) => set({ isOpen: true, appointmentId }),
  onClose: () => set({ isOpen: false, appointmentId: null }),
}));
