import PageHero from "../presentation/components/ui/PageHero";
import SectionCard from "../presentation/components/ui/SectionCard";

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export default function PriceManagementPage({
  products,
  priceProductId,
  setPriceProductId,
  newPrice,
  setNewPrice,
  selectedPriceProduct,
  onSubmit,
  savingPrice,
}) {
  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 980px) {
          .price-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <PageHero
        kicker="Yönetim alanı"
        title="Fiyat Yönetimi"
        subtitle="Ürünlerin birim fiyatlarını güncelle ve değişiklikleri yönet."
        variant="green"
      />

      <div className="price-grid" style={styles.grid}>
        <SectionCard
          title="Fiyat Güncelle"
          subtitle="Seçtiğin ürünün birim fiyatını değiştir."
          padding={24}
        >
          <form onSubmit={onSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Ürün</label>
              <select
                style={styles.input}
                value={priceProductId}
                onChange={(e) => setPriceProductId(e.target.value)}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Yeni Birim Fiyat</label>
              <input
                style={styles.input}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                type="number"
                step="0.01"
                placeholder="Yeni fiyat girin"
              />
            </div>

            <button type="submit" style={styles.submitButton} disabled={savingPrice}>
              {savingPrice ? "Kaydediliyor..." : "Fiyatı Güncelle"}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Seçili Ürün"
          subtitle="Güncellenecek ürünün mevcut bilgileri"
          padding={24}
        >
          <div style={styles.summaryWrap}>
            <SummaryRow
              label="Ürün"
              value={selectedPriceProduct?.name || "-"}
            />
            <SummaryRow
              label="Mevcut Fiyat"
              value={
                selectedPriceProduct
                  ? formatMoney(selectedPriceProduct.unit_price)
                  : "-"
              }
            />
            <SummaryRow
              label="Birim"
              value={selectedPriceProduct?.unit || "-"}
            />
            <SummaryRow
              label="KDV"
              value={
                selectedPriceProduct
                  ? `${selectedPriceProduct.vat_type || "-"} • %${selectedPriceProduct.vat_rate ?? 0}`
                  : "-"
              }
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={styles.summaryRow}>
      <span style={styles.summaryLabel}>{label}</span>
      <span style={styles.summaryValue}>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 0.9fr",
    gap: "18px",
  },

  form: {
    display: "grid",
    gap: "16px",
  },
  field: {
    display: "grid",
    gap: "8px",
  },
  label: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: 800,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "16px",
    border: "1px solid #dbe4ef",
    background: "#fff",
    padding: "14px 16px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
  },
  submitButton: {
    marginTop: "8px",
    border: "none",
    borderRadius: "18px",
    padding: "16px",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 20px 40px rgba(59,130,246,0.18)",
  },

  summaryWrap: {
    display: "grid",
    gap: "0",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 0",
    borderTop: "1px solid #f1f5f9",
  },
  summaryLabel: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 700,
  },
  summaryValue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 800,
    textAlign: "right",
  },
};