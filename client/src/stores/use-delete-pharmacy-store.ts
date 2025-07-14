import { create } from "zustand";



type DeleteStore = {
  isOpen: boolean;
  pharmacy?: PharmacyResponseDto;
  onOpen: (pharmacy: PharmacyResponseDto) => void;
  onClose: () => void;
};

export const useDeletePharmacyStore = create<DeleteStore>((set) => ({
  isOpen: false,
  pharmacy: undefined,
  onOpen: (pharmacy) => set({ isOpen: true, pharmacy }),
  onClose: () => set({ isOpen: false, pharmacy: undefined }),
}));
