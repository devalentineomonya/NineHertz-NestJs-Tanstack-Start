import { create } from 'zustand';

interface CancelAppointmentStore {
  isOpen: boolean;
  appointmentId: string | null;
  onOpen: (appointmentId: string) => void;
  onClose: () => void;
}

export const useCancelAppointmentStore = create<CancelAppointmentStore>((set) => ({
  isOpen: false,
  appointmentId: null,
  onOpen: (appointmentId) => set({ isOpen: true, appointmentId }),
  onClose: () => set({ isOpen: false, appointmentId: null }),
}));
