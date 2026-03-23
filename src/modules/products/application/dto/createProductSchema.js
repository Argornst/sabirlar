import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunludur."),
  unit: z.string().min(1, "Birim zorunludur."),
  unitPrice: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz."),
  vatType: z.string().min(1, "KDV tipi zorunludur."),
  vatRate: z.coerce.number().min(0, "KDV oranı 0'dan küçük olamaz."),
});

export const createProductDefaultValues = {
  name: "",
  unit: "adet",
  unitPrice: 0,
  vatType: "HARIC",
  vatRate: 20,
};