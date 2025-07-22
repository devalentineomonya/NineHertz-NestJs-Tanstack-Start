import { z } from "zod";

export const AdjustmentType = z.enum(["add", "remove", "set"]);
export type AdjustmentType = z.infer<typeof AdjustmentType>;

export const AdjustmentReason = z.enum([
  "damaged",
  "expired",
  "donation",
  "transfer",
  "other",
]);
export type AdjustmentReason = z.infer<typeof AdjustmentReason>;

export const adjustQuantitySchema = z.object({
  adjustmentType: AdjustmentType,
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  reason: AdjustmentReason,
  notes: z.string().optional(),
});

export type AdjustQuantityFormData = z.infer<typeof adjustQuantitySchema>;
