import { create } from "zustand";

type AppointmentPaymentStore = {
  isOpen: boolean;
  appointment: AppointmentResponseDto | null;
  open: (appointment: AppointmentResponseDto) => void;
  close: () => void;
};

export const useAppointmentPaymentStore = create<AppointmentPaymentStore>(
  (set) => ({
    isOpen: false,
    appointment: null,
    open: (appointment) => set({ isOpen: true, appointment }),
    close: () => set({ isOpen: false, appointment: null }),
  })
);
