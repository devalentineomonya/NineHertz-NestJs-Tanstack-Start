import { create } from "zustand";

interface ViewAppointmentStore {
  id: string | null;
  isOpen: boolean;
  appointment: AppointmentResponseDto | null;
  onOpen: (id: string, appointment: AppointmentResponseDto) => void;
  onClose: () => void;
}

const useViewAppointmentStore = create<ViewAppointmentStore>((set) => ({
  id: null,
  appointment: null,
  isOpen: false,
  onOpen: (id: string, appointment: AppointmentResponseDto) =>
    set(() => ({
      appointment,
      id,
      isOpen: true,
    })),
  onClose: () => set({ appointment: null, id: null, isOpen: false }),
}));

export default useViewAppointmentStore;
