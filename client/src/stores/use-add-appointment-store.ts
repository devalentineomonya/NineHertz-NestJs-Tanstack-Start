import { create } from "zustand";
interface AddAppointment {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useAddAppointmentStore = create<AddAppointment>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
