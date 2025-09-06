import { create } from "zustand";

interface ViewPatient {
  isOpen: boolean;
  id: string | null;
  patient: PatientResponseDto | null;
  onOpen: (id: string | null, user?: PatientResponseDto | null) => void;
  onClose: () => void;
}

export const useViewPatientStore = create<ViewPatient>((set) => ({
  isOpen: false,
  id: null,
  patient: null,
  onOpen: (id, patient) => set({ isOpen: true, id, patient }),
  onClose: () => set({ isOpen: false, id: null, patient: null }),
}));
