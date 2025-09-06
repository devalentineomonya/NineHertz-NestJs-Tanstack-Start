import { create } from "zustand";

enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor",
  ADMIN = "admin",
  PHARMACIST = "pharmacist",
}

type SignUpStore = {
  step: number;
  method: "email" | "google" | null;
  setStep: (step: number) => void;
  setMethod: (method: "email" | "google") => void;

  user: CreateUserDto & { id?: string };
  setUser: (partialUser: Partial<CreateUserDto & { id?: string }>) => void;

  isEmailVerified: boolean;
  setIsEmailVerified: (verified: boolean) => void;

  reset: () => void;
};

export const useSignUpStore = create<SignUpStore>((set) => ({
  step: 1,
  method: null,
  setStep: (step) => set({ step }),
  setMethod: (method) => set({ method }),

  user: {
    email: "",
    role: UserRole.PATIENT,
    password: "",
  },
  setUser: (partialUser) =>
    set((state) => ({
      user: {
        ...state.user,
        ...partialUser,
      },
    })),

  isEmailVerified: false,
  setIsEmailVerified: (isEmailVerified) => set({ isEmailVerified }),

  reset: () =>
    set({
      step: 1,
      method: null,
      user: { email: "", role: UserRole.PATIENT, password: "" },
      isEmailVerified: false,
    }),
}));
