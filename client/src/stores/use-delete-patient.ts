import { create } from "zustand";

interface DeletePatientState {
  isOpen: boolean;
  patientId: string | null;
  openModal: (patientId: string) => void;
  closeModal: () => void;
}

export const useDeletePatientStore = create<DeletePatientState>((set) => ({
  isOpen: false,
  patientId: null,
  patientRole: null,
  openModal: (patientId) => set({ isOpen: true, patientId }),
  closeModal: () => set({ isOpen: false, patientId: null }),
}));
