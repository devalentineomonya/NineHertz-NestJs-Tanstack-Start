import { create } from "zustand";

interface UpdateDoctorStore {
  isOpen: boolean;
  doctor: DoctorResponseDto | null;
  onOpen: (doctor: DoctorResponseDto) => void;
  onClose: () => void;
}

export const useUpdateDoctorAvailabilityStore = create<UpdateDoctorStore>((set) => ({
  isOpen: false,
  doctor: null,
  onOpen: (doctor) => set({ isOpen: true, doctor }),
  onClose: () => set({ isOpen: false, doctor: null }),
}));
