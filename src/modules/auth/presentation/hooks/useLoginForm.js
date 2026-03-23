import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { loginDefaultValues, loginSchema } from "../../application/loginSchema";
import { authRepository } from "../../infrastructure/authRepository";

export function useLoginForm() {
  const [formError, setFormError] = useState("");

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    setFormError("");

    try {
      const resolved = await authRepository.resolveLogin(values.login);

      const result = await authRepository.signInWithPassword({
        email: resolved.email,
        password: values.password,
      });

      await logActivity({
        action: AUDIT_ACTIONS.LOGIN_SUCCESS,
        entityType: AUDIT_ENTITY_TYPES.AUTH,
        actorUserId: result?.user?.id ?? null,
        actorEmail: resolved.email,
        metadata: {
          login: values.login,
        },
      });
    } catch (error) {
      const rawMessage = error?.message || "Giriş yapılamadı.";

      if (
        rawMessage.toLowerCase().includes("invalid login credentials") ||
        rawMessage.toLowerCase().includes("invalid credentials")
      ) {
        setFormError("Kullanıcı adı/e-posta veya şifre yanlış.");
        return;
      }

      setFormError(rawMessage);
    }
  });

  return {
    register,
    errors,
    isSubmitting,
    formError,
    onSubmit,
  };
}