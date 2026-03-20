import { useNavigate } from "react-router-dom";
import PageHero from "../presentation/components/ui/PageHero";
import SectionCard from "../presentation/components/ui/SectionCard";

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export default function NewSalePage({
  products,
  saleDate,
  setSaleDate,
  customerName,
  setCustomerName,
  saleProductId,
  setSaleProductId,
  quantity,
  setQuantity,
  saleStatus,
  setSaleStatus,
  selectedSaleProduct,
  calculatedTotal,
  onSubmit,
  savingSale,
  isAdmin,
  editingSaleId,
}) {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 980px) {
          .new-sale-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .new-sale-field-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <PageHero
        kicker={editingSaleId ? "Düzenleme modu" : "Yeni kayıt"}
        title={editingSaleId ? "Satışı Düzenle" : "Yeni Satış Oluştur"}
        subtitle="Satış bilgilerini eksiksiz gir, sistem toplamı otomatik hesaplasın."
        variant="green"
      />

      <div className="new-sale-grid" style={styles.grid}>
        <SectionCard
          title="Satış Bilgileri"
          subtitle="Kayıt oluşturmak için gerekli alanları doldur."
          padding={24}
        >
          <form onSubmit={(e) => onSubmit(e, navigate)} style={styles.form}>
            <div className="new-sale-field-grid" style={styles.fieldGrid}>
              <Field label="Tarih">
                <input
                  style={styles.input}
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                />
              </Field>

              <Field label="Miktar">
                <input
                  style={styles.input}
                  type="number"
                  step="0.001"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Müşteri Adı Soyadı">
              <input
                style={styles.input}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Müşteri adı soyadı girin"
              />
            </Field>

            <Field label="Ürün">
              <select
                style={styles.input}
                value={saleProductId}
                onChange={(e) => setSaleProductId(e.target.value)}
              >
                <option value="">Ürün seçin</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Durum">
              {isAdmin ? (
                <select
                  style={styles.input}
                  value={saleStatus}
                  onChange={(e) => setSaleStatus(e.target.value)}
                >
                  <option value="beklemede">beklemede</option>
                  <option value="onaylandi">onaylandi</option>
                  <option value="faturalandi">faturalandi</option>
                  <option value="iptal">iptal</option>
                </select>
              ) : (
                <input
                  style={{ ...styles.input, background: "#f8fafc" }}
                  value="beklemede"
                  readOnly
                />
              )}
            </Field>

            <button
              type="submit"
              style={styles.submitButton}
              disabled={savingSale}
            >
              {savingSale
                ? "Kaydediliyor..."
                : editingSaleId
                ? "Değişiklikleri Kaydet"
                : "Satışı Kaydet"}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Satış Özeti"
          subtitle="Seçtiğin ürün ve miktara göre özet bilgiler"
          padding={24}
        >
          <div style={styles.summaryWrap}>
            <SummaryRow
              label="Seçilen Ürün"
              value={selectedSaleProduct?.name || "-"}
            />
            <SummaryRow
              label="Birim"
              value={selectedSaleProduct?.unit || "-"}
            />
            <SummaryRow
              label="Birim Fiyat"
              value={
                selectedSaleProduct
                  ? formatMoney(selectedSaleProduct.unit_price)
                  : "-"
              }
            />
            <SummaryRow
              label="KDV Tipi"
              value={selectedSaleProduct?.vat_type || "-"}
            />
            <SummaryRow
              label="KDV Oranı"
              value={
                selectedSaleProduct?.vat_rate !== undefined
                  ? `%${selectedSaleProduct.vat_rate}`
                  : "-"
              }
            />

            <div style={styles.totalBox}>
              <div style={styles.totalLabel}>Genel Toplam</div>
              <div style={styles.totalValue}>{formatMoney(calculatedTotal)}</div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
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
  gridTemplateColumns: "minmax(0,1.2fr) minmax(0,0.8fr)",
  gap: "18px",
},

  form: {
    display: "grid",
    gap: "16px",
  },
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
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
  totalBox: {
    marginTop: "14px",
    background:
      "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.10) 100%)",
    border: "1px solid rgba(16,185,129,0.14)",
    borderRadius: "22px",
    padding: "18px",
  },
  totalLabel: {
    color: "#047857",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "8px",
  },
  totalValue: {
    color: "#0f172a",
    fontSize: "30px",
    fontWeight: 900,
    lineHeight: 1.1,
  },
};