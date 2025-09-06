import { create } from "zustand";

interface UpdatePharmacist {
  id: string | null;
  isOpen: boolean;
  onOpen: (id: string, pharmacist: PharmacistResponseDto) => void;
  onClose: () => void;
  pharmacist: PharmacistResponseDto | null;
}

export const useEditPharmacistStore = create<UpdatePharmacist>((set) => ({
  isOpen: false,
  id: null,
  pharmacist: null,
  onOpen: (id: string, pharmacist: PharmacistResponseDto) =>
    set({ isOpen: true, pharmacist, id }),
  onClose: () => set({ isOpen: false, pharmacist: null, id: null }),
}));
