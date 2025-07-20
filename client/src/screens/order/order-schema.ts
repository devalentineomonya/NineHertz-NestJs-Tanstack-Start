import { z } from 'zod';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum MedicineType {
  OTC = 'otc',
  PRESCRIBED = 'prescribed',
}

export const orderSchema = z.object({
  patientId: z.string().uuid('Invalid UUID format'),
  items: z
    .array(
      z.object({
        medicineId: z.string().uuid('Invalid UUID format'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        pricePerUnit: z.number().min(0.01, 'Price must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
  status: z.nativeEnum(OrderStatus),
  totalAmount: z.number().min(0.01, 'Total must be positive'),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
