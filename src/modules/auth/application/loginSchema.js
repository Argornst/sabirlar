import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(1, "Kullanıcı adı veya e-posta zorunludur."),
  password: z
    .string()
    .min(1, "Şifre zorunludur.")
    .min(6, "Şifre en az 6 karakter olmalıdır."),
});

export const loginDefaultValues = {
  login: "",
  password: "",
};