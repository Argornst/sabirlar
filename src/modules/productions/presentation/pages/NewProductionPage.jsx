import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarBlank } from "@phosphor-icons/react";

import AnimatedPage from "../../../../shared/components/ui/AnimatedPage";
import Card from "../../../../shared/components/ui/Card";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import Button from "../../../../shared/components/ui/Button";
import { ROUTES } from "../../../../shared/constants/routes";

import "../productions.css";
import { createEmptyProductionForm } from "../../domain/entities/production.entity";
import { ProductionForm } from "../components/ProductionForm";
import { useCreateProductionMutation } from "../hooks/useCreateProductionMutation";

export default function NewProductionPage() {
  const navigate = useNavigate();
  const createMutation = useCreateProductionMutation();
  const [errors, setErrors] = useState({});

  const handleSubmit = async (values) => {
    setErrors({});

    try {
      await createMutation.mutateAsync(values);
      navigate(ROUTES.DISPATCH_PLAN);
    } catch (error) {
      if (error?.type === "validation") {
        setErrors(error.fields || {});
        return;
      }

      setErrors({
        form:
          error?.message ||
          error?.details ||
          error?.hint ||
          "Kayıt oluşturulurken bir hata oluştu.",
      });
    }
  };

  return (
    <AnimatedPage>
      <Card>
        <PageHeader
          title="Yeni Üretim"
          description="Lot, müşteri, ürün, miktar, paketleme, palet ve sevkiyat bilgilerini girerek yeni üretim kaydı oluştur."
          badge="Üretim Girişi"
          actions={
            <div className="production-header-actions">
              <Link to={ROUTES.PRODUCTIONS}>
                <Button variant="secondary" className="btn-premium">
                  <ArrowLeft size={18} />
                  Üretim Listesi
                </Button>
              </Link>

              <Link to={ROUTES.DISPATCH_PLAN}>
                <Button variant="secondary" className="btn-premium">
                  <CalendarBlank size={18} />
                  Sevkiyat Planı
                </Button>
              </Link>
            </div>
          }
        />

        <div className="production-form-surface">
          {errors.form ? <div className="production-alert">{errors.form}</div> : null}

          <ProductionForm
            initialValues={createEmptyProductionForm()}
            errors={errors}
            loading={createMutation.isPending}
            submitLabel="Üretim Kaydını Oluştur"
            onSubmit={handleSubmit}
          />
        </div>
      </Card>
    </AnimatedPage>
  );
}