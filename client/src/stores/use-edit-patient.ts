import { create } from "zustand";

interface EditPatient {
  isOpen: boolean;
  id: string | null;
  patient: PatientResponseDto | null;
  onOpen: (id: string, patient: PatientResponseDto) => void;
  onClose: () => void;
}

export const useEditPatient = create<EditPatient>((set) => ({
  isOpen: false,
  id: null,
  patient: null,
  onOpen: (id, patient) => set({ isOpen: true, id, patient }),
  onClose: () => set({ isOpen: false, id: null, patient: null }),
}));
