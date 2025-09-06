import { create } from 'zustand';

interface EditMedicineStore {
  isOpen: boolean;
  id: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useEditMedicineStore = create<EditMedicineStore>((set) => ({
  isOpen: false,
  id: null,
  onOpen: (id) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: null }),
}));
