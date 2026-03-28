import { useNavigate } from "react-router-dom";
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
  createSaleDefaultValues,
  createSaleSchema,
} from "../../application/dto/createSaleSchema";
import { createSale } from "../../application/use-cases/createSale";
import { salesRepository } from "../../infrastructure/repositories/salesRepository";
import { productsRepository } from "../../../products/infrastructure/repositories/productsRepository";
import { ROUTES } from "../../../../shared/constants/routes";

export function useCreateSaleForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, activeOrganization } = useAuth();

  const form = useForm({
    resolver: zodResolver(createSaleSchema),
    defaultValues: createSaleDefaultValues,
    mode: "onSubmit",
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      createSale({
        salesRepository,
        productsRepository,
        userId: user?.id ?? null,
        organizationId: activeOrganization?.id ?? null,
        values,
      }),
    onSuccess: async (createdSale) => {
      await logActivity({
        action: AUDIT_ACTIONS.SALE_CREATED,
        entityType: AUDIT_ENTITY_TYPES.SALE,
        entityId: createdSale?.id ?? null,
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
        metadata: {
          customer_name: createdSale?.customerName ?? null,
          total_amount: createdSale?.totalAmount ?? null,
          item_count: createdSale?.items?.length ?? 0,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["sales"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["reports-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });

      navigate(ROUTES.SALES);
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
          "Sipariş oluşturulurken hata oluştu."
        )
      : "",
  };
}