import { z } from "zod";

export const updateSaleSchema = z.object({
  saleDate: z.string().min(1, "Satış tarihi zorunludur."),
  customerName: z.string().min(1, "Müşteri adı zorunludur."),
  quantity: z.coerce.number().min(1, "Adet en az 1 olmalıdır."),
  status: z.string().min(1, "Durum zorunludur."),
  note: z.string().optional(),
});