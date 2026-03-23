import { z } from "zod";

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta zorunludur.")
    .email("Geçerli bir e-posta adresi girin."),
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
  roleId: z.string().min(1, "Rol seçimi zorunludur."),
  organizationId: z.string().min(1, "Organizasyon seçimi zorunludur."),
});

export const createUserDefaultValues = {
  email: "",
  username: "",
  fullName: "",
  password: "",
  roleId: "",
  organizationId: "",
};