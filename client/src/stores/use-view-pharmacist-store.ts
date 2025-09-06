import { create } from "zustand";

interface ViewPharmacist {
  isOpen: boolean;
  id: string | null;
  onOpen: (id: string, pharmacist: PharmacistResponseDto) => void;
  onClose: () => void;
  pharmacist: PharmacistResponseDto | null;
}

export const useViewPharmacistStore = create<ViewPharmacist>((set) => ({
  isOpen: false,
  id: null,
  pharmacist: null,
  onOpen: (id, pharmacist) => set({ isOpen: true, id, pharmacist }),
  onClose: () => set({ isOpen: false, id: null, pharmacist: null }),
}));
