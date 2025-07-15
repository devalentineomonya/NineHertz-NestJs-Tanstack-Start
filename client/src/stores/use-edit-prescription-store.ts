import { create } from 'zustand';

interface EditPrescriptionStore {
  isOpen: boolean;
  id: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useEditPrescriptionStore = create<EditPrescriptionStore>((set) => ({
  isOpen: false,
  id: null,
  onOpen: (id) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: null }),
}));
