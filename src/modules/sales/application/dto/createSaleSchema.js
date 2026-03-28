import { z } from "zod";

export const createSaleItemSchema = z.object({
  productId: z.string().min(1, "Ürün seçimi zorunludur."),
  quantity: z.coerce.number().gt(0, "Miktar 0'dan büyük olmalıdır."),
});

export const createSaleSchema = z.object({
  saleDate: z.string().min(1, "Satış tarihi zorunludur."),
  customerName: z.string().min(1, "Müşteri adı zorunludur."),
  paymentStatus: z.enum(["beklemede", "odendi"]),
  invoiceStatus: z.enum(["faturalanmadi", "faturalandi"]),
  items: z.array(createSaleItemSchema).min(1, "En az bir ürün eklemelisiniz."),
  note: z.string().optional(),
});

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");

export const createSaleDefaultValues = {
  saleDate: `${yyyy}-${mm}-${dd}`,
  customerName: "",
  paymentStatus: "beklemede",
  invoiceStatus: "faturalanmadi",
  items: [
    {
      productId: "",
      quantity: 1,
    },
  ],
  note: "",
};