import { create } from 'zustand';

interface DeleteConsultationStore {
  isOpen: boolean;
  consultationId: string | null;
  onOpen: (consultationId: string) => void;
  onClose: () => void;
}

export const useDeleteConsultationStore = create<DeleteConsultationStore>((set) => ({
  isOpen: false,
  consultationId: null,
  onOpen: (consultationId) => set({ isOpen: true, consultationId }),
  onClose: () => set({ isOpen: false, consultationId: null }),
}));
