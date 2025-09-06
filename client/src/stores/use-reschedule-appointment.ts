import { create } from "zustand";

interface RescheduleAppointment {
  isOpen: boolean;
  id: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}
export const useRescheduleAppointmentStore = create<RescheduleAppointment>(
  (set) => ({
    isOpen: false,
    id: null,
    onOpen: (id: string) => set({ isOpen: true, id }),
    onClose: () => set({ isOpen: false, id: null }),
  })
);
