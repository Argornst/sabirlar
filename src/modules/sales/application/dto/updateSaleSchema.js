import { z } from "zod";

const updateSaleItemSchema = z.object({
  productId: z.string().min(1, "Ürün seçimi zorunludur."),
  quantity: z.coerce.number().gt(0, "Miktar 0'dan büyük olmalıdır."),
});

export const updateSaleSchema = z.object({
  saleDate: z.string().min(1, "Satış tarihi zorunludur."),
  customerName: z.string().min(1, "Müşteri adı zorunludur."),
  paymentStatus: z.enum(["beklemede", "odendi"]),
  invoiceStatus: z.enum(["faturalanmadi", "faturalandi"]),
  items: z.array(updateSaleItemSchema).min(1, "En az bir ürün eklemelisiniz."),
  note: z.string().optional(),
});