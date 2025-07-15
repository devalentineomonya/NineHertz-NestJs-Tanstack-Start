import { create } from 'zustand';

interface ViewMedicineStore {
  isOpen: boolean;
  medicine: MedicineResponseDto | null;
  id: string | null;
  onOpen: (id: string, medicine: MedicineResponseDto) => void;
  onClose: () => void;
}

export const useViewMedicineStore = create<ViewMedicineStore>((set) => ({
  isOpen: false,
  medicine: null,
  id: null,
  onOpen: (id, medicine) => set({ isOpen: true, id, medicine }),
  onClose: () => set({ isOpen: false, id: null, medicine: null }),
}));
