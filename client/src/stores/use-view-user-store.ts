import { create } from "zustand";

interface ViewUserState {
  isOpen: boolean;
  user: UserResponseDto | null;
  id: string | null;
  onOpen: (user: UserResponseDto, id: string) => void;
  onClose: () => void;
}

export const useViewUser = create<ViewUserState>((set) => ({
  isOpen: false,
  user: null,
  id: null,
  onOpen: (user, id) =>
    set({
      isOpen: true,
      user: user,
      id,
    }),
  onClose: () =>
    set({
      isOpen: false,
      user: null,
      id: null,
    }),
}));
