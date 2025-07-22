import { z } from "zod";

export const reorderSchema = z.object({
  restockQuantity: z.number().int().min(1, "Quantity must be at least 1"),
  supplier: z.string().min(1, "Supplier is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  notes: z.string().optional(),
});

export type ReorderFormData = z.infer<typeof reorderSchema>;
