import { useCreateSaleForm } from "../hooks/useCreateSaleForm";

export default function NewSalePage() {
  const {
    register,
    onSubmit,
    formState: { errors },
    isSubmitting,
    submitError,
  } = useCreateSaleForm();

  return (
    <section className="page-card">
      <h3>New Sale</h3>
      <p>Yeni satış kaydı oluştur</p>

      <form className="form-grid form-grid--two-columns" onSubmit={onSubmit}>
        <div className="form-field">
          <label htmlFor="customerName">Müşteri Adı</label>
          <input
            id="customerName"
            type="text"
            placeholder="Müşteri adı"
            {...register("customerName")}
          />
          {errors.customerName ? (
            <div className="error-text">{errors.customerName.message}</div>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="productName">Ürün Adı</label>
          <input
            id="productName"
            type="text"
            placeholder="Ürün adı"
            {...register("productName")}
          />
          {errors.productName ? (
            <div className="error-text">{errors.productName.message}</div>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="quantity">Adet</label>
          <input
            id="quantity"
            type="number"
            min="1"
            {...register("quantity")}
          />
          {errors.quantity ? (
            <div className="error-text">{errors.quantity.message}</div>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="unitPrice">Birim Fiyat</label>
          <input
            id="unitPrice"
            type="number"
            min="0"
            step="0.01"
            {...register("unitPrice")}
          />
          {errors.unitPrice ? (
            <div className="error-text">{errors.unitPrice.message}</div>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="currency">Para Birimi</label>
          <input
            id="currency"
            type="text"
            placeholder="TRY"
            {...register("currency")}
          />
          {errors.currency ? (
            <div className="error-text">{errors.currency.message}</div>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="status">Durum</label>
          <select id="status" {...register("status")} className="form-select">
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="cancelled">cancelled</option>
          </select>
          {errors.status ? (
            <div className="error-text">{errors.status.message}</div>
          ) : null}
        </div>

        {submitError ? <div className="error-text">{submitError}</div> : null}

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Satışı Kaydet"}
          </button>
        </div>
      </form>
    </section>
  );
}