import { z } from "zod";

export const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const doctorFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  specialty: z.string().min(2, "Specialty must be at least 2 characters"),
  availability: z.array(
    z.object({
      day: z.enum(daysOfWeek),
      slots: z.array(
        z.object({
          start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        })
      ),
    })
  ),
  appointmentFee: z
    .number()
    .min(0, "Appointment fee must be a positive number"),
  licenseNumber: z
    .string()
    .min(2, "License number must be at least 2 characters"),
  userId: z.string().min(1, "User selection is required"),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;
