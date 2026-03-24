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
  createProductDefaultValues,
  createProductSchema,
} from "../../application/dto/createProductSchema";
import { createProduct } from "../../application/use-cases/createProduct";
import { productsRepository } from "../../infrastructure/repositories/productsRepository";

export function useCreateProductForm() {
  const queryClient = useQueryClient();
  const { user, activeOrganization } = useAuth();

  const form = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: createProductDefaultValues,
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      createProduct({
        productsRepository,
        values,
        organizationId: activeOrganization?.id ?? null,
      }),
    onSuccess: async (createdProduct) => {
      form.reset(createProductDefaultValues);

      await logActivity({
        action: AUDIT_ACTIONS.PRODUCT_CREATED,
        entityType: AUDIT_ENTITY_TYPES.PRODUCT,
        entityId: createdProduct?.id ?? null,
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
        metadata: {
          name: createdProduct?.name ?? null,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["reports-summary"] });
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
          "Ürün oluşturulurken hata oluştu."
        )
      : "",
  };
}