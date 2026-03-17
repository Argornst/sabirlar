import { useMemo, useState } from "react";
import SkeletonTable from "../presentation/components/common/SkeletonTable";
import PageHero from "../presentation/components/ui/PageHero";
import SectionCard from "../presentation/components/ui/SectionCard";

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function getProductInitials(name) {
  if (!name) return "Ü";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProductsPage({ products, loadingProducts, onCreateProduct }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchTerm.trim()) {
      const normalizedSearch = searchTerm.toLocaleLowerCase("tr-TR").trim();

      list = list.filter((product) => {
        const name = (product.name || "").toLocaleLowerCase("tr-TR");
        const unit = (product.unit || "").toLocaleLowerCase("tr-TR");
        const vatType = (product.vat_type || "").toLocaleLowerCase("tr-TR");

        return (
          name.includes(normalizedSearch) ||
          unit.includes(normalizedSearch) ||
          vatType.includes(normalizedSearch)
        );
      });
    }

    if (statusFilter === "active") {
      list = list.filter((product) => product.is_active);
    }

    if (statusFilter === "passive") {
      list = list.filter((product) => !product.is_active);
    }

    list.sort((a, b) => {
      if (sortBy === "name-asc") {
        return (a.name || "").localeCompare(b.name || "", "tr");
      }

      if (sortBy === "name-desc") {
        return (b.name || "").localeCompare(a.name || "", "tr");
      }

      if (sortBy === "price-asc") {
        return (Number(a.unit_price) || 0) - (Number(b.unit_price) || 0);
      }

      if (sortBy === "price-desc") {
        return (Number(b.unit_price) || 0) - (Number(a.unit_price) || 0);
      }

      return 0;
    });

    return list;
  }, [products, searchTerm, statusFilter, sortBy]);

  if (loadingProducts) {
    return (
      <SkeletonTable
        rows={6}
        columns={6}
        title="Ürünler yükleniyor"
        subtitle="Ürün listesi hazırlanıyor..."
      />
    );
  }

  const activeCount = products.filter((product) => product.is_active).length;
  const passiveCount = products.filter((product) => !product.is_active).length;
  const avgPrice =
    products.length > 0
      ? products.reduce((sum, product) => sum + (Number(product.unit_price) || 0), 0) /
        products.length
      : 0;

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 1024px) {
          .products-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .products-toolbar {
            grid-template-columns: 1fr !important;
          }

          .products-toolbar-right {
            justify-content: flex-start !important;
          }
        }

        @media (max-width: 640px) {
          .products-grid {
            grid-template-columns: 1fr !important;
          }

          .products-stats {
            grid-template-columns: 1fr !important;
          }

          .products-card-top {
            flex-direction: column;
            align-items: flex-start !important;
          }

          .products-price-row {
            flex-direction: column;
            align-items: flex-start !important;
          }

          .products-toolbar-left {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .products-toolbar-right {
            width: 100%;
          }

          .products-new-button {
            width: 100%;
            justify-content: center;
          }

          .products-filter-chips {
            flex-wrap: wrap;
          }
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 28px 60px rgba(15, 23, 42, 0.10);
          border-color: rgba(191, 219, 254, 1);
        }

        .toolbar-input:focus,
        .toolbar-select:focus {
          outline: none;
          border-color: #93c5fd;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.10);
        }
      `}</style>

      <PageHero
        kicker="Ürün kataloğu"
        title="Ürünler"
        subtitle="Aktif ürünler ve fiyat bilgileri burada listelenir."
        variant="blue"
      />

      <div className="products-stats" style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Toplam Ürün</div>
          <div style={styles.statValue}>{products.length}</div>
          <div style={styles.statHint}>Katalogda kayıtlı ürün sayısı</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Aktif Ürün</div>
          <div style={styles.statValue}>{activeCount}</div>
          <div style={styles.statHint}>Satışta olan ürünler</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pasif Ürün</div>
          <div style={styles.statValue}>{passiveCount}</div>
          <div style={styles.statHint}>Görünürlüğü kapalı ürünler</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Ortalama Fiyat</div>
          <div style={styles.statValue}>{formatMoney(avgPrice)}</div>
          <div style={styles.statHint}>Birim fiyat ortalaması</div>
        </div>
      </div>

      <SectionCard
        title="Ürün Listesi"
        subtitle="Sistemde tanımlı aktif ürünler"
        rightContent={
          <div style={styles.badgeWrap}>
            <div style={styles.badgeGlow} />
            <div style={styles.badge}>{filteredProducts.length} sonuç</div>
          </div>
        }
      >
        <div className="products-toolbar" style={styles.toolbar}>
          <div className="products-toolbar-left" style={styles.toolbarLeft}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>⌕</span>
              <input
                className="toolbar-input"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ürün ara..."
                style={styles.searchInput}
              />
            </div>

            <div className="products-filter-chips" style={styles.filterChips}>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                style={
                  statusFilter === "all"
                    ? styles.filterChipActive
                    : styles.filterChip
                }
              >
                Tümü
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                style={
                  statusFilter === "active"
                    ? styles.filterChipActive
                    : styles.filterChip
                }
              >
                Aktif
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("passive")}
                style={
                  statusFilter === "passive"
                    ? styles.filterChipActive
                    : styles.filterChip
                }
              >
                Pasif
              </button>
            </div>

            <select
              className="toolbar-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              style={styles.select}
            >
              <option value="name-asc">Ada göre (A-Z)</option>
              <option value="name-desc">Ada göre (Z-A)</option>
              <option value="price-asc">Fiyata göre (artan)</option>
              <option value="price-desc">Fiyata göre (azalan)</option>
            </select>
          </div>

          <div className="products-toolbar-right" style={styles.toolbarRight}>
            <button
              type="button"
              className="products-new-button"
              onClick={onCreateProduct}
              style={styles.newButton}
            >
              + Yeni Ürün
            </button>
          </div>
        </div>

        <div className="products-grid" style={styles.grid}>
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card" style={styles.card}>
              <div style={styles.cardGlow} />

              <div className="products-card-top" style={styles.cardTop}>
                <div style={styles.identity}>
                  <div style={styles.avatar}>{getProductInitials(product.name)}</div>

                  <div>
                    <div style={styles.name}>{product.name}</div>
                    <div style={styles.meta}>
                      {product.unit || "-"} • {product.vat_type || "-"} • %
                      {product.vat_rate ?? 0}
                    </div>
                  </div>
                </div>

                <div
                  style={product.is_active ? styles.activeBadge : styles.passiveBadge}
                >
                  <span
                    style={
                      product.is_active ? styles.activeBadgeDot : styles.passiveBadgeDot
                    }
                  />
                  {product.is_active ? "Aktif" : "Pasif"}
                </div>
              </div>

              <div style={styles.divider} />

              <div className="products-price-row" style={styles.priceRow}>
                <div>
                  <div style={styles.priceLabel}>Birim Fiyat</div>
                  <div style={styles.price}>{formatMoney(product.unit_price)}</div>
                </div>

                <div style={styles.pricePill}>
                  {product.vat_type || "KDV"} %{product.vat_rate ?? 0}
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>□</div>
              <div style={styles.emptyTitle}>Sonuç bulunamadı</div>
              <div style={styles.emptyText}>
                Arama veya filtre kriterlerine uygun ürün yok. Filtreleri temizleyip
                tekrar deneyin.
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

const glassSurface = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.68) 100%)",
  border: "1px solid rgba(226,232,240,0.95)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 20px 45px rgba(15,23,42,0.07)",
};

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
  },

  statCard: {
    ...glassSurface,
    borderRadius: "24px",
    padding: "18px 18px 16px",
    position: "relative",
    overflow: "hidden",
  },

  statLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  statValue: {
    marginTop: "10px",
    color: "#0f172a",
    fontWeight: 900,
    fontSize: "28px",
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
  },

  statHint: {
    marginTop: "8px",
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  badgeWrap: {
    position: "relative",
    display: "inline-flex",
  },

  badgeGlow: {
    position: "absolute",
    inset: "2px",
    background: "rgba(59,130,246,0.12)",
    filter: "blur(10px)",
    borderRadius: "999px",
  },

  badge: {
    position: "relative",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(226,232,240,1)",
    color: "#1e293b",
    fontWeight: 800,
    fontSize: "12px",
    boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
  },

  toolbar: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "16px",
    alignItems: "center",
    marginBottom: "18px",
    padding: "14px",
    borderRadius: "24px",
    background: "linear-gradient(180deg, rgba(248,250,252,0.9) 0%, rgba(255,255,255,0.72) 100%)",
    border: "1px solid rgba(226,232,240,1)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
  },

  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  toolbarRight: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  searchWrap: {
    position: "relative",
    minWidth: "240px",
    flex: 1,
    maxWidth: "360px",
  },

  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    fontSize: "14px",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    height: "44px",
    padding: "0 14px 0 38px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.88)",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 160ms ease",
  },

  filterChips: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  filterChip: {
    height: "40px",
    padding: "0 14px",
    borderRadius: "999px",
    border: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.75)",
    color: "#475569",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 160ms ease",
  },

  filterChipActive: {
    height: "40px",
    padding: "0 14px",
    borderRadius: "999px",
    border: "1px solid rgba(147,197,253,1)",
    background: "linear-gradient(180deg, rgba(239,246,255,1) 0%, rgba(219,234,254,1) 100%)",
    color: "#1d4ed8",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(59,130,246,0.10)",
    transition: "all 160ms ease",
  },

  select: {
    height: "44px",
    padding: "0 14px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.88)",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 700,
    minWidth: "190px",
    transition: "all 160ms ease",
  },

  newButton: {
    height: "44px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "1px solid rgba(59,130,246,0.16)",
    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
    boxShadow: "0 14px 30px rgba(37,99,235,0.20)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 160ms ease",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },

  card: {
    ...glassSurface,
    position: "relative",
    overflow: "hidden",
    borderRadius: "28px",
    padding: "20px",
    transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
  },

  cardGlow: {
    position: "absolute",
    top: "-40px",
    right: "-20px",
    width: "140px",
    height: "140px",
    background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0) 70%)",
    pointerEvents: "none",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    position: "relative",
    zIndex: 1,
  },

  identity: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    minWidth: 0,
  },

  avatar: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    color: "#2563eb",
    fontWeight: 900,
    fontSize: "13px",
    background:
      "linear-gradient(135deg, rgba(219,234,254,1) 0%, rgba(239,246,255,0.95) 100%)",
    border: "1px solid rgba(191,219,254,1)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
  },

  name: {
    color: "#0f172a",
    fontWeight: 900,
    fontSize: "18px",
    marginBottom: "8px",
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
  },

  meta: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  divider: {
    height: "1px",
    background:
      "linear-gradient(90deg, rgba(226,232,240,0) 0%, rgba(226,232,240,1) 20%, rgba(226,232,240,1) 80%, rgba(226,232,240,0) 100%)",
    margin: "18px 0 16px",
  },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-end",
    position: "relative",
    zIndex: 1,
  },

  priceLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },

  price: {
    color: "#0f172a",
    fontSize: "30px",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
  },

  pricePill: {
    padding: "9px 12px",
    borderRadius: "999px",
    background: "rgba(248,250,252,0.95)",
    border: "1px solid rgba(226,232,240,1)",
    color: "#475569",
    fontWeight: 800,
    fontSize: "12px",
    whiteSpace: "nowrap",
  },

  activeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(236,253,245,0.95)",
    color: "#047857",
    fontWeight: 800,
    fontSize: "12px",
    whiteSpace: "nowrap",
    border: "1px solid rgba(167,243,208,0.9)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
  },

  passiveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(241,245,249,0.95)",
    color: "#475569",
    fontWeight: 800,
    fontSize: "12px",
    whiteSpace: "nowrap",
    border: "1px solid rgba(226,232,240,1)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
  },

  activeBadgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#10b981",
    boxShadow: "0 0 0 4px rgba(16,185,129,0.12)",
  },

  passiveBadgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#94a3b8",
    boxShadow: "0 0 0 4px rgba(148,163,184,0.12)",
  },

  empty: {
    gridColumn: "1 / -1",
    ...glassSurface,
    borderRadius: "28px",
    padding: "40px 24px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "56px",
    height: "56px",
    margin: "0 auto 16px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(248,250,252,1) 100%)",
    border: "1px solid rgba(219,234,254,1)",
    color: "#3b82f6",
    fontWeight: 900,
    fontSize: "24px",
  },

  emptyTitle: {
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: 900,
    marginBottom: "8px",
    letterSpacing: "-0.02em",
  },

  emptyText: {
    maxWidth: "480px",
    margin: "0 auto",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.7,
  },
};