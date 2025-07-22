import { z } from "zod";

export const patientFormSchema = z.object({
  userId: z.string().min(1, "User selection is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be a valid E.164 format"),
  dateOfBirth: z.date().optional(),
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
