import { create } from "zustand";

type UpdateDoctorStore = {
  isOpen: boolean;
  currentDoctor: DoctorResponseDto | null;
  onOpen: (doctor: DoctorResponseDto) => void;
  onClose: () => void;
};

export const useUpdateDoctorStore = create<UpdateDoctorStore>((set) => ({
  isOpen: false,
  currentDoctor: null,
  onOpen: (doctor) => set({ isOpen: true, currentDoctor: doctor }),
  onClose: () => set({ isOpen: false, currentDoctor: null }),
}));
