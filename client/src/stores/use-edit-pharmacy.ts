import { create } from "zustand";

type EditStore = {
  isOpen: boolean;
  pharmacy?: PharmacyResponseDto;
  onOpen: (pharmacy: PharmacyResponseDto) => void;
  onClose: () => void;
};

export const useEditPharmacyStore = create<EditStore>((set) => ({
  isOpen: false,
  pharmacy: undefined,
  onOpen: (pharmacy) => set({ isOpen: true, pharmacy }),
  onClose: () => set({ isOpen: false, pharmacy: undefined }),
}));
