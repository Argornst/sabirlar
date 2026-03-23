import { z } from "zod";

export const createSaleSchema = z.object({
  saleDate: z.string().min(1, "Satış tarihi zorunludur."),
  customerName: z.string().min(1, "Müşteri adı zorunludur."),
  productId: z.string().min(1, "Ürün seçimi zorunludur."),
  quantity: z.coerce.number().min(1, "Adet en az 1 olmalıdır."),
  status: z.string().min(1, "Durum zorunludur."),
  note: z.string().optional(),
});

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");

export const createSaleDefaultValues = {
  saleDate: `${yyyy}-${mm}-${dd}`,
  customerName: "",
  productId: "",
  quantity: 1,
  status: "beklemede",
  note: "",
};