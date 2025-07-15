import { create } from 'zustand';

interface ViewPharmacyStore {
  isOpen: boolean;
  pharmacy: PharmacyResponseDto | null;
  id: string | null;
  onOpen: (id: string, pharmacy: PharmacyResponseDto) => void;
  onClose: () => void;
}

export const useViewPharmacyStore = create<ViewPharmacyStore>((set) => ({
  isOpen: false,
  pharmacy: null,
  id: null,
  onOpen: (id, pharmacy) => set({ isOpen: true, id, pharmacy }),
  onClose: () => set({ isOpen: false, id: null, pharmacy: null }),
}));
