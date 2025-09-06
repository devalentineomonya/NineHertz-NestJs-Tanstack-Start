import { z } from "zod";

export const appointmentTypes = [
  "consultation",
  "checkup",
  "follow-up",
  "emergency",
] as const;
export const appointmentModes = ["virtual", "physical"] as const;
export const appointmentStatuses = [
  "scheduled",
  "completed",
  "cancelled",
] as const;

export const appointmentFormSchema = z.object({
  datetime: z.date(),
  patientId: z.string(),
  doctorId: z.string(),
  status: z.enum(["completed", "cancelled", "scheduled"]),
  type: z.enum(["consultation", "checkup", "follow-up", "emergency"]),
  mode: z.enum(["virtual", "physical"]),
  videoSessionId: z.string().optional(),
  notes: z.string().optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
