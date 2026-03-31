import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../../app/providers/AppProviders";
import { useCurrentOrganization } from "../../../users/presentation/hooks/useCurrentOrganization";
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
  const { user } = useAuth();
  const {
    organization,
    isLoading: isOrganizationLoading,
    isFetching: isOrganizationFetching,
    error: organizationError,
  } = useCurrentOrganization();

  const form = useForm({
    resolver: zodResolver(createSaleSchema),
    defaultValues: createSaleDefaultValues,
    mode: "onSubmit",
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (!organization?.id) {
        throw new Error("Organizasyon bilgisi yüklenemedi.");
      }

      return createSale({
        salesRepository,
        productsRepository,
        userId: user?.id ?? null,
        organizationId: organization.id,
        values,
      });
    },
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
          organization_id: organization?.id ?? null,
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
    if (organizationError) {
      throw new Error("Organizasyon bilgisi alınamadı.");
    }

    if (!organization?.id) {
      throw new Error("Organizasyon yükleniyor, lütfen tekrar deneyin.");
    }

    await mutation.mutateAsync(values);
  });

  return {
    ...form,
    onSubmit,
    isSubmitting:
      mutation.isPending || isOrganizationLoading || isOrganizationFetching,
    submitError: mutation.error
      ? getReadableErrorMessage(
          mutation.error,
          "Sipariş oluşturulurken hata oluştu."
        )
      : "",
  };
}