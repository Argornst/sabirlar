import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../../app/providers/AppProviders";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { getReadableErrorMessage } from "../../../../shared/lib/error/getReadableErrorMessage";
import {
  createUserDefaultValues,
  createUserSchema,
} from "../../application/dto/createUserSchema";
import { createUser } from "../../application/use-cases/createUser";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useCreateUserForm() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: createUserDefaultValues,
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      createUser({
        usersRepository,
        values,
      }),
    onSuccess: async (createdUser) => {
      form.reset(createUserDefaultValues);

      await logActivity({
        action: AUDIT_ACTIONS.USER_CREATED,
        entityType: AUDIT_ENTITY_TYPES.USER,
        entityId: createdUser?.user?.id ?? null,
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
        metadata: {
          email: createdUser?.user?.email ?? null,
          organization_name: createdUser?.organization?.name ?? null,
          role_name: createdUser?.role?.name ?? null,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  return {
    ...form,
    onSubmit,
    isSubmitting: mutation.isPending,
    submitError: mutation.error
      ? getReadableErrorMessage(
          mutation.error,
          "Kullanıcı oluşturulurken hata oluştu."
        )
      : "",
  };
}