import { create } from "zustand";

interface DeletePharmacistState {
  pharmacistId: string | null;
  isModalOpen: boolean;
  openModal: (id:string) => void;
  closeModal: () => void;
}

export const useDeletePharmacistStore = create<DeletePharmacistState>(
  (set) => ({
    pharmacistId: null,
    isModalOpen: false,
    openModal: (id: string) => set({ isModalOpen: true, pharmacistId: id }),
    closeModal: () => set({ isModalOpen: false, pharmacistId: null }),
  })
);
