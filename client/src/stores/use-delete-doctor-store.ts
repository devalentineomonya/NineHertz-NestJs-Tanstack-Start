import { create } from 'zustand';

type DeleteDoctorStore = {
  isOpen: boolean;
  doctorId: string | null;
  openModal: (doctorId: string) => void;
  closeModal: () => void;
};

export const useDeleteDoctorStore = create<DeleteDoctorStore>((set) => ({
  isOpen: false,
  doctorId: null,
  openModal: (doctorId) => set({ isOpen: true, doctorId }),
  closeModal: () => set({ isOpen: false, doctorId: null }),
}));
