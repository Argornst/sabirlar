import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      navigate("/dispatch-plan");
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
    <div className="production-page">
      <div className="production-page__header">
        <div>
          <h1 className="production-page__title">Yeni Üretim Kaydı</h1>
          <p className="production-page__subtitle">
            Lot, müşteri, ürün, miktar, paketleme ve palet bilgilerini gir.
          </p>
        </div>
      </div>

      <div className="production-card">
        {errors.form ? <div className="production-alert">{errors.form}</div> : null}

        <ProductionForm
          initialValues={createEmptyProductionForm()}
          errors={errors}
          loading={createMutation.isPending}
          submitLabel="Üretim Kaydını Oluştur"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}