import { create } from "zustand";

interface DoctorAvailabilityState {
  isOpen: boolean;
  doctorId: string | null;
  openDrawer: (doctorId: string) => void;
  closeDrawer: () => void;
}

export const useDoctorAvailabilityStore = create<DoctorAvailabilityState>(
  (set) => ({
    isOpen: false,
    doctorId: null,
    openDrawer: (doctorId) => set({ isOpen: true, doctorId }),
    closeDrawer: () => set({ isOpen: false, doctorId: null }),
  })
);
