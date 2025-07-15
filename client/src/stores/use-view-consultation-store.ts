import { create } from "zustand";

interface ViewConsultationStore {
  isOpen: boolean;
  consultation: ConsultationResponseDto | null;
  id: string | null;
  onOpen: (id: string, consultation: ConsultationResponseDto) => void;
  onClose: () => void;
}

export const useViewConsultationStore = create<ViewConsultationStore>(
  (set) => ({
    isOpen: false,
    consultation: null,
    id: null,
    onOpen: (id, consultation) => set({ isOpen: true, id, consultation }),
    onClose: () => set({ isOpen: false, id: null, consultation: null }),
  })
);
