import { create } from 'zustand';

interface DeleteMedicineStore {
  isOpen: boolean;
  medicineId: string | null;
  onOpen: (medicineId: string) => void;
  onClose: () => void;
}

export const useDeleteMedicineStore = create<DeleteMedicineStore>((set) => ({
  isOpen: false,
  medicineId: null,
  onOpen: (medicineId) => set({ isOpen: true, medicineId }),
  onClose: () => set({ isOpen: false, medicineId: null }),
}));
