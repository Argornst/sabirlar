import { useEffect, useMemo, useState } from "react";
import SkeletonTable from "../presentation/components/common/SkeletonTable";
import PageHero from "../presentation/components/ui/PageHero";
import SectionCard from "../presentation/components/ui/SectionCard";
import { supabase } from "../infrastructure/supabase/client";
import { useToast } from "../presentation/hooks/useToast";
import { useAuth } from "../presentation/hooks/useAuth";

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

function exportProductsCsv(rows, fileName = "urunler.csv") {
  const headers = [
    "ID",
    "Ürün Adı",
    "Birim",
    "KDV Tipi",
    "KDV Oranı",
    "Birim Fiyat",
    "Durum",
  ];

  const csvRows = rows.map((product) => [
    product.id ?? "",
    product.name ?? "",
    product.unit ?? "",
    product.vat_type ?? "",
    product.vat_rate ?? 0,
    product.unit_price ?? 0,
    product.is_active ? "Aktif" : "Pasif",
  ]);

  const escapeCell = (value) => {
    const stringValue = String(value ?? "");
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const csvContent = [headers, ...csvRows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ProductsPage({
  products = [],
  loadingProducts,
  onProductsRefresh,
}) {
  const toast = useToast();
  const auth = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState("table");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [savingProduct, setSavingProduct] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [togglingProductId, setTogglingProductId] = useState(null);

  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPrice, setTempPrice] = useState("");
  const [savingInlinePriceId, setSavingInlinePriceId] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    unit: "",
    vat_type: "DAHIL",
    vat_rate: 1,
    unit_price: "",
    is_active: true,
  });

  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    unit: "",
    vat_type: "DAHIL",
    vat_rate: 1,
    unit_price: "",
    is_active: true,
  });

  function resetCreateForm() {
    setCreateForm({
      name: "",
      unit: "",
      vat_type: "DAHIL",
      vat_rate: 1,
      unit_price: "",
      is_active: true,
    });
  }

  function handleCreateChange(field, value) {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleEditChange(field, value) {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function openEditModal(product) {
    setEditForm({
      id: product.id,
      name: product.name || "",
      unit: product.unit || "",
      vat_type: product.vat_type || "DAHIL",
      vat_rate: product.vat_rate ?? 1,
      unit_price: product.unit_price ?? "",
      is_active: !!product.is_active,
    });

    setIsEditOpen(true);
  }

  function closeEditModal() {
    setIsEditOpen(false);
    setEditForm({
      id: null,
      name: "",
      unit: "",
      vat_type: "DAHIL",
      vat_rate: 1,
      unit_price: "",
      is_active: true,
    });
  }

  function openDeleteModal(product) {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteOpen(false);
    setSelectedProduct(null);
  }

  function startInlinePriceEdit(product) {
    setEditingPriceId(product.id);
    setTempPrice(String(product.unit_price ?? ""));
  }

  function cancelInlinePriceEdit() {
    setEditingPriceId(null);
    setTempPrice("");
  }

  function isSelected(productId) {
    return selectedProductIds.includes(productId);
  }

  function toggleSelectProduct(productId) {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  function toggleSelectAllVisible(filteredRows) {
    const visibleIds = filteredRows.map((product) => product.id);
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedProductIds.includes(id));

    if (allVisibleSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  }

  function clearSelection() {
    setSelectedProductIds([]);
  }

  function handleExportFiltered() {
    if (!filteredProducts.length) {
      toast.warning("Veri yok", "Dışa aktarılacak ürün bulunamadı.");
      return;
    }

    exportProductsCsv(filteredProducts, "filtrelenmis-urunler.csv");
    toast.info("CSV hazırlandı", "Filtrelenmiş ürünler dışa aktarıldı.");
  }

  function handleExportSelected() {
    const selectedProducts = filteredProducts.filter((product) =>
      selectedProductIds.includes(product.id)
    );

    if (!selectedProducts.length) {
      toast.warning("Seçim yok", "Dışa aktarılacak seçili ürün bulunamadı.");
      return;
    }

    exportProductsCsv(selectedProducts, "secili-urunler.csv");
    toast.info("CSV hazırlandı", "Seçili ürünler dışa aktarıldı.");
  }

  async function saveInlinePrice(product) {
    const userId = auth?.session?.user?.id || null;
    const numericPrice = Number(tempPrice);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.warning("Geçersiz fiyat", "Lütfen sıfırdan büyük bir fiyat gir.");
      return;
    }

    if (Number(product.unit_price) === numericPrice) {
      cancelInlinePriceEdit();
      return;
    }

    try {
      setSavingInlinePriceId(product.id);

      const { error } = await supabase
        .from("products")
        .update({
          unit_price: numericPrice,
          updated_by: userId,
        })
        .eq("id", product.id);

      if (error) throw error;

      await onProductsRefresh?.();

      toast.success(
        "Fiyat güncellendi",
        `${product.name} için yeni fiyat kaydedildi.`
      );

      cancelInlinePriceEdit();
    } catch (error) {
      console.error("saveInlinePrice error:", error);
      toast.error(
        "Fiyat güncellenemedi",
        error?.message || "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setSavingInlinePriceId(null);
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault();

    const name = createForm.name.trim();
    const unit = createForm.unit.trim();
    const vatRate = Number(createForm.vat_rate);
    const unitPrice = Number(createForm.unit_price);
    const userId = auth?.session?.user?.id || null;

    if (!name) {
      toast.warning("Eksik bilgi", "Ürün adı zorunludur.");
      return;
    }

    if (!unit) {
      toast.warning("Eksik bilgi", "Birim alanı zorunludur.");
      return;
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      toast.warning("Geçersiz fiyat", "Lütfen sıfırdan büyük bir fiyat gir.");
      return;
    }

    if (!Number.isFinite(vatRate) || vatRate < 0) {
      toast.warning("Geçersiz KDV", "Lütfen geçerli bir KDV oranı gir.");
      return;
    }

    try {
      setSavingProduct(true);

      const { error } = await supabase.from("products").insert([
        {
          name,
          unit,
          vat_type: createForm.vat_type,
          vat_rate: vatRate,
          unit_price: unitPrice,
          is_active: createForm.is_active,
          updated_by: userId,
        },
      ]);

      if (error) throw error;

      await onProductsRefresh?.();

      toast.success("Ürün oluşturuldu", `${name} başarıyla ürün listesine eklendi.`);

      resetCreateForm();
      setIsCreateOpen(false);
    } catch (error) {
      console.error("handleCreateProduct error:", error);
      toast.error(
        "Ürün oluşturulamadı",
        error?.message || "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleUpdateProduct(e) {
    e.preventDefault();

    const name = editForm.name.trim();
    const unit = editForm.unit.trim();
    const vatRate = Number(editForm.vat_rate);
    const unitPrice = Number(editForm.unit_price);
    const userId = auth?.session?.user?.id || null;

    if (!editForm.id) {
      toast.error("Güncelleme hatası", "Düzenlenecek ürün bulunamadı.");
      return;
    }

    if (!name) {
      toast.warning("Eksik bilgi", "Ürün adı zorunludur.");
      return;
    }

    if (!unit) {
      toast.warning("Eksik bilgi", "Birim alanı zorunludur.");
      return;
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      toast.warning("Geçersiz fiyat", "Lütfen sıfırdan büyük bir fiyat gir.");
      return;
    }

    if (!Number.isFinite(vatRate) || vatRate < 0) {
      toast.warning("Geçersiz KDV", "Lütfen geçerli bir KDV oranı gir.");
      return;
    }

    try {
      setUpdatingProduct(true);

      const { error } = await supabase
        .from("products")
        .update({
          name,
          unit,
          vat_type: editForm.vat_type,
          vat_rate: vatRate,
          unit_price: unitPrice,
          is_active: editForm.is_active,
          updated_by: userId,
        })
        .eq("id", editForm.id);

      if (error) throw error;

      await onProductsRefresh?.();

      toast.success("Ürün güncellendi", `${name} başarıyla güncellendi.`);
      closeEditModal();
    } catch (error) {
      console.error("handleUpdateProduct error:", error);
      toast.error(
        "Ürün güncellenemedi",
        error?.message || "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setUpdatingProduct(false);
    }
  }

  async function handleToggleProductStatus(product) {
    const userId = auth?.session?.user?.id || null;
    const nextIsActive = !product.is_active;

    try {
      setTogglingProductId(product.id);

      const { error } = await supabase
        .from("products")
        .update({
          is_active: nextIsActive,
          updated_by: userId,
        })
        .eq("id", product.id);

      if (error) throw error;

      await onProductsRefresh?.();

      toast.success(
        nextIsActive ? "Ürün aktif edildi" : "Ürün pasife alındı",
        `${product.name} başarıyla ${nextIsActive ? "aktif" : "pasif"} duruma getirildi.`
      );
    } catch (error) {
      console.error("handleToggleProductStatus error:", error);
      toast.error(
        "Durum güncellenemedi",
        error?.message || "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setTogglingProductId(null);
    }
  }

  async function handleBulkStatusUpdate(nextIsActive) {
    if (!selectedProductIds.length) return;

    const userId = auth?.session?.user?.id || null;

    try {
      setBulkUpdating(true);

      const { error } = await supabase
        .from("products")
        .update({
          is_active: nextIsActive,
          updated_by: userId,
        })
        .in("id", selectedProductIds);

      if (error) throw error;

      await onProductsRefresh?.();

      toast.success(
        nextIsActive ? "Ürünler aktif edildi" : "Ürünler pasife alındı",
        `${selectedProductIds.length} ürün başarıyla güncellendi.`
      );

      clearSelection();
    } catch (error) {
      console.error("handleBulkStatusUpdate error:", error);
      toast.error(
        "Toplu işlem başarısız",
        error?.message || "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setBulkUpdating(false);
    }
  }

  async function handleDeleteProduct() {
    if (!selectedProduct) return;

    try {
      setDeletingProduct(true);

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct.id);

      if (error) throw error;

      await onProductsRefresh?.();

      toast.success(
        "Ürün silindi",
        `${selectedProduct.name} sistemden kaldırıldı.`
      );

      closeDeleteModal();
    } catch (error) {
      console.error("handleDeleteProduct error:", error);
      toast.error(
        "Silme başarısız",
        error?.message || "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setDeletingProduct(false);
    }
  }

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

  useEffect(() => {
    setSelectedProductIds([]);
  }, [searchTerm, statusFilter, sortBy, viewMode]);

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

        @media (max-width: 820px) {
          .products-table-wrap {
            overflow-x: auto;
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

          .product-form-grid {
            grid-template-columns: 1fr !important;
          }

          .product-actions {
            flex-direction: column;
          }

          .view-switch {
            width: 100%;
          }

          .bulk-bar {
            flex-direction: column;
            align-items: stretch !important;
          }
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 28px 60px rgba(15, 23, 42, 0.10);
          border-color: rgba(191, 219, 254, 1);
        }

        .toolbar-input:focus,
        .toolbar-select:focus,
        .product-form-input:focus,
        .product-form-select:focus,
        .inline-price-input:focus {
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
        subtitle="Sistemde tanımlı ürünler"
        rightContent={
          <div style={styles.headerRightWrap}>
            <div className="view-switch" style={styles.viewSwitch}>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                style={viewMode === "cards" ? styles.viewButtonActive : styles.viewButton}
              >
                Kart
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                style={viewMode === "table" ? styles.viewButtonActive : styles.viewButton}
              >
                Tablo
              </button>
            </div>

            <div style={styles.badgeWrap}>
              <div style={styles.badgeGlow} />
              <div style={styles.badge}>{filteredProducts.length} sonuç</div>
            </div>
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
                style={statusFilter === "all" ? styles.filterChipActive : styles.filterChip}
              >
                Tümü
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                style={statusFilter === "active" ? styles.filterChipActive : styles.filterChip}
              >
                Aktif
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("passive")}
                style={statusFilter === "passive" ? styles.filterChipActive : styles.filterChip}
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
              onClick={handleExportFiltered}
              style={styles.secondaryActionButton}
            >
              CSV Dışa Aktar
            </button>

            <button
              type="button"
              className="products-new-button"
              onClick={() => setIsCreateOpen(true)}
              style={styles.newButton}
            >
              + Yeni Ürün
            </button>
          </div>
        </div>

        {viewMode === "cards" ? (
          <div className="products-grid" style={styles.grid}>
            {filteredProducts.map((product) => {
              const isToggling = togglingProductId === product.id;
              const isEditingPrice = editingPriceId === product.id;
              const isSavingInlinePrice = savingInlinePriceId === product.id;

              return (
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

                    <div style={product.is_active ? styles.activeBadge : styles.passiveBadge}>
                      <span
                        style={product.is_active ? styles.activeBadgeDot : styles.passiveBadgeDot}
                      />
                      {product.is_active ? "Aktif" : "Pasif"}
                    </div>
                  </div>

                  <div style={styles.divider} />

                  <div className="products-price-row" style={styles.priceRow}>
                    <div>
                      <div style={styles.priceLabel}>Birim Fiyat</div>

                      {isEditingPrice ? (
                        <input
                          autoFocus
                          className="inline-price-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={tempPrice}
                          disabled={isSavingInlinePrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          onBlur={() => saveInlinePrice(product)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveInlinePrice(product);
                            }

                            if (e.key === "Escape") {
                              e.preventDefault();
                              cancelInlinePriceEdit();
                            }
                          }}
                          style={styles.inlinePriceInput}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => startInlinePriceEdit(product)}
                          style={styles.inlinePriceButton}
                          title="Fiyatı hızlı düzenle"
                        >
                          {formatMoney(product.unit_price)}
                        </button>
                      )}

                      <div style={styles.inlinePriceHint}>
                        {isSavingInlinePrice
                          ? "Kaydediliyor..."
                          : isEditingPrice
                          ? "Enter kaydet • Esc iptal"
                          : "Tıkla ve hızlı düzenle"}
                      </div>
                    </div>

                    <div style={styles.pricePill}>
                      {product.vat_type || "KDV"} %{product.vat_rate ?? 0}
                    </div>
                  </div>

                  <div className="product-actions" style={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      style={styles.secondaryActionButton}
                    >
                      Düzenle
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleProductStatus(product)}
                      disabled={isToggling}
                      style={product.is_active ? styles.warningActionButton : styles.successActionButton}
                    >
                      {isToggling
                        ? "İşleniyor..."
                        : product.is_active
                        ? "Pasife Al"
                        : "Aktif Et"}
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(product)}
                      style={styles.dangerActionButton}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>□</div>
                <div style={styles.emptyTitle}>Sonuç bulunamadı</div>
                <div style={styles.emptyText}>
                  Arama veya filtre kriterlerine uygun ürün yok. Filtreleri temizleyip tekrar
                  deneyin.
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {selectedProductIds.length > 0 && (
              <div className="bulk-bar" style={styles.bulkBar}>
                <div style={styles.bulkInfo}>
                  {selectedProductIds.length} ürün seçildi
                </div>

                <div style={styles.bulkActions}>
                  <button
                    type="button"
                    onClick={handleExportSelected}
                    disabled={bulkUpdating}
                    style={styles.secondaryActionButton}
                  >
                    Seçilileri CSV Aktar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBulkStatusUpdate(true)}
                    disabled={bulkUpdating}
                    style={styles.successActionButton}
                  >
                    {bulkUpdating ? "İşleniyor..." : "Toplu Aktif Et"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBulkStatusUpdate(false)}
                    disabled={bulkUpdating}
                    style={styles.warningActionButton}
                  >
                    {bulkUpdating ? "İşleniyor..." : "Toplu Pasife Al"}
                  </button>

                  <button
                    type="button"
                    onClick={clearSelection}
                    disabled={bulkUpdating}
                    style={styles.secondaryActionButton}
                  >
                    Temizle
                  </button>
                </div>
              </div>
            )}

            <div className="products-table-wrap" style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thCheckbox}>
                      <input
                        type="checkbox"
                        checked={
                          filteredProducts.length > 0 &&
                          filteredProducts.every((product) =>
                            selectedProductIds.includes(product.id)
                          )
                        }
                        onChange={() => toggleSelectAllVisible(filteredProducts)}
                      />
                    </th>
                    <th style={styles.th}>Ürün</th>
                    <th style={styles.th}>Birim</th>
                    <th style={styles.th}>KDV</th>
                    <th style={styles.th}>Fiyat</th>
                    <th style={styles.th}>Durum</th>
                    <th style={styles.th}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const isToggling = togglingProductId === product.id;
                    const isEditingPrice = editingPriceId === product.id;
                    const isSavingInlinePrice = savingInlinePriceId === product.id;

                    return (
                      <tr key={product.id} style={styles.tr}>
                        <td style={styles.tdCheckbox}>
                          <input
                            type="checkbox"
                            checked={isSelected(product.id)}
                            onChange={() => toggleSelectProduct(product.id)}
                          />
                        </td>

                        <td style={styles.tdProduct}>
                          <div style={styles.tableIdentity}>
                            <div style={styles.tableAvatar}>
                              {getProductInitials(product.name)}
                            </div>
                            <div>
                              <div style={styles.tableName}>{product.name}</div>
                            </div>
                          </div>
                        </td>

                        <td style={styles.td}>{product.unit || "-"}</td>

                        <td style={styles.td}>
                          {product.vat_type || "-"} • %{product.vat_rate ?? 0}
                        </td>

                        <td style={styles.td}>
                          {isEditingPrice ? (
                            <input
                              autoFocus
                              className="inline-price-input"
                              type="number"
                              min="0"
                              step="0.01"
                              value={tempPrice}
                              disabled={isSavingInlinePrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              onBlur={() => saveInlinePrice(product)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  saveInlinePrice(product);
                                }

                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  cancelInlinePriceEdit();
                                }
                              }}
                              style={styles.inlineTablePriceInput}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => startInlinePriceEdit(product)}
                              style={styles.inlineTablePriceButton}
                            >
                              {formatMoney(product.unit_price)}
                            </button>
                          )}

                          <div style={styles.tablePriceHint}>
                            {isSavingInlinePrice
                              ? "Kaydediliyor..."
                              : isEditingPrice
                              ? "Enter / Esc"
                              : "Hızlı düzenle"}
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={product.is_active ? styles.activeBadge : styles.passiveBadge}
                          >
                            <span
                              style={
                                product.is_active
                                  ? styles.activeBadgeDot
                                  : styles.passiveBadgeDot
                              }
                            />
                            {product.is_active ? "Aktif" : "Pasif"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.tableActions}>
                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              style={styles.secondaryActionButton}
                            >
                              Düzenle
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleProductStatus(product)}
                              disabled={isToggling}
                              style={
                                product.is_active
                                  ? styles.warningActionButton
                                  : styles.successActionButton
                              }
                            >
                              {isToggling
                                ? "İşleniyor..."
                                : product.is_active
                                ? "Pasife Al"
                                : "Aktif Et"}
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(product)}
                              style={styles.dangerActionButton}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon}>□</div>
                  <div style={styles.emptyTitle}>Sonuç bulunamadı</div>
                  <div style={styles.emptyText}>
                    Arama veya filtre kriterlerine uygun ürün yok. Filtreleri temizleyip tekrar
                    deneyin.
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SectionCard>

      {isCreateOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsCreateOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateProduct}>
              <div style={styles.modalHeader}>
                <div>
                  <div style={styles.modalTitle}>Yeni Ürün</div>
                  <div style={styles.modalSubtitle}>
                    Yeni ürün bilgisini doldurup doğrudan kataloğa ekleyebilirsin.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={styles.modalCloseButton}
                >
                  ×
                </button>
              </div>

              <div style={styles.modalBody}>
                <div className="product-form-grid" style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Ürün Adı</label>
                    <input
                      className="product-form-input"
                      value={createForm.name}
                      onChange={(e) => handleCreateChange("name", e.target.value)}
                      placeholder="Örn. Kavrulmuş İç Fındık"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Birim</label>
                    <input
                      className="product-form-input"
                      value={createForm.unit}
                      onChange={(e) => handleCreateChange("unit", e.target.value)}
                      placeholder="Örn. kg"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Birim Fiyat</label>
                    <input
                      className="product-form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={createForm.unit_price}
                      onChange={(e) => handleCreateChange("unit_price", e.target.value)}
                      placeholder="0.00"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>KDV Tipi</label>
                    <select
                      className="product-form-select"
                      value={createForm.vat_type}
                      onChange={(e) => handleCreateChange("vat_type", e.target.value)}
                      style={styles.input}
                    >
                      <option value="DAHIL">DAHİL</option>
                      <option value="HARIC">HARİÇ</option>
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>KDV Oranı</label>
                    <input
                      className="product-form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={createForm.vat_rate}
                      onChange={(e) => handleCreateChange("vat_rate", e.target.value)}
                      placeholder="1"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.checkboxField}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={createForm.is_active}
                        onChange={(e) => handleCreateChange("is_active", e.target.checked)}
                      />
                      <span>Ürün aktif olarak oluşturulsun</span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={styles.secondaryButton}
                >
                  İptal
                </button>

                <button type="submit" disabled={savingProduct} style={styles.primaryButton}>
                  {savingProduct ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div style={styles.modalOverlay} onClick={closeEditModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleUpdateProduct}>
              <div style={styles.modalHeader}>
                <div>
                  <div style={styles.modalTitle}>Ürünü Düzenle</div>
                  <div style={styles.modalSubtitle}>
                    Ürün bilgilerini, fiyatını ve aktiflik durumunu güncelleyebilirsin.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  style={styles.modalCloseButton}
                >
                  ×
                </button>
              </div>

              <div style={styles.modalBody}>
                <div className="product-form-grid" style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Ürün Adı</label>
                    <input
                      className="product-form-input"
                      value={editForm.name}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      placeholder="Örn. Kavrulmuş İç Fındık"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Birim</label>
                    <input
                      className="product-form-input"
                      value={editForm.unit}
                      onChange={(e) => handleEditChange("unit", e.target.value)}
                      placeholder="Örn. kg"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Birim Fiyat</label>
                    <input
                      className="product-form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.unit_price}
                      onChange={(e) => handleEditChange("unit_price", e.target.value)}
                      placeholder="0.00"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>KDV Tipi</label>
                    <select
                      className="product-form-select"
                      value={editForm.vat_type}
                      onChange={(e) => handleEditChange("vat_type", e.target.value)}
                      style={styles.input}
                    >
                      <option value="DAHIL">DAHİL</option>
                      <option value="HARIC">HARİÇ</option>
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>KDV Oranı</label>
                    <input
                      className="product-form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.vat_rate}
                      onChange={(e) => handleEditChange("vat_rate", e.target.value)}
                      placeholder="1"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.checkboxField}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={editForm.is_active}
                        onChange={(e) => handleEditChange("is_active", e.target.checked)}
                      />
                      <span>Ürün aktif olsun</span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={styles.secondaryButton}
                >
                  İptal
                </button>

                <button type="submit" disabled={updatingProduct} style={styles.primaryButton}>
                  {updatingProduct ? "Güncelleniyor..." : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div style={styles.modalOverlay} onClick={closeDeleteModal}>
          <div style={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalTitle}>Ürünü Sil</div>
                <div style={styles.modalSubtitle}>
                  Bu işlem geri alınamaz. Ürün sistemden tamamen kaldırılacaktır.
                </div>
              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                style={styles.modalCloseButton}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.deleteWarningBox}>
                <div style={styles.deleteWarningTitle}>
                  Silinecek ürün: {selectedProduct?.name || "-"}
                </div>
                <div style={styles.deleteWarningText}>
                  Ürün geçmiş satış kayıtlarında kullanıldıysa hard delete yerine pasife alma
                  daha güvenlidir.
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={closeDeleteModal}
                style={styles.secondaryButton}
              >
                İptal
              </button>

              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deletingProduct}
                style={styles.dangerButton}
              >
                {deletingProduct ? "Siliniyor..." : "Evet, sil"}
              </button>
            </div>
          </div>
        </div>
      )}
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

  headerRightWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  viewSwitch: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px",
    borderRadius: "999px",
    background: "rgba(248,250,252,0.95)",
    border: "1px solid rgba(226,232,240,1)",
    boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
  },

  viewButton: {
    height: "36px",
    padding: "0 14px",
    borderRadius: "999px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontWeight: 800,
    cursor: "pointer",
  },

  viewButtonActive: {
    height: "36px",
    padding: "0 14px",
    borderRadius: "999px",
    border: "1px solid rgba(147,197,253,1)",
    background:
      "linear-gradient(180deg, rgba(239,246,255,1) 0%, rgba(219,234,254,1) 100%)",
    color: "#1d4ed8",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(59,130,246,0.10)",
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
    background:
      "linear-gradient(180deg, rgba(248,250,252,0.9) 0%, rgba(255,255,255,0.72) 100%)",
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
    gap: "10px",
    flexWrap: "wrap",
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
    background:
      "linear-gradient(180deg, rgba(239,246,255,1) 0%, rgba(219,234,254,1) 100%)",
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

  inlinePriceButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    color: "#0f172a",
    fontSize: "30px",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    cursor: "pointer",
    textAlign: "left",
  },

  inlinePriceInput: {
    width: "160px",
    height: "48px",
    padding: "0 14px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.92)",
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    transition: "all 160ms ease",
  },

  inlinePriceHint: {
    marginTop: "8px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
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

  cardActions: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },

  tableWrap: {
    width: "100%",
    maxHeight: "70vh",
    overflow: "auto",
    borderRadius: "22px",
    border: "1px solid rgba(226,232,240,1)",
    background: "rgba(255,255,255,0.66)",
  },

  bulkBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 16px",
    marginBottom: "12px",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg, rgba(239,246,255,0.95) 0%, rgba(219,234,254,0.88) 100%)",
    border: "1px solid rgba(147,197,253,0.9)",
  },

  bulkInfo: {
    color: "#1e3a8a",
    fontSize: "14px",
    fontWeight: 800,
  },

  bulkActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  table: {
    width: "100%",
    minWidth: "980px",
    borderCollapse: "separate",
    borderSpacing: 0,
  },

  th: {
    position: "sticky",
    top: 0,
    zIndex: 3,
    textAlign: "left",
    padding: "16px 18px",
    fontSize: "12px",
    fontWeight: 900,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid rgba(226,232,240,1)",
    background: "rgba(248,250,252,0.98)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  thCheckbox: {
    position: "sticky",
    top: 0,
    zIndex: 4,
    width: "48px",
    textAlign: "center",
    padding: "16px 12px",
    fontSize: "12px",
    fontWeight: 900,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid rgba(226,232,240,1)",
    background: "rgba(248,250,252,0.98)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  tr: {
    background: "transparent",
  },

  td: {
    padding: "16px 18px",
    borderBottom: "1px solid rgba(241,245,249,1)",
    color: "#0f172a",
    fontSize: "14px",
    verticalAlign: "middle",
    background: "rgba(255,255,255,0.54)",
  },

  tdCheckbox: {
    width: "48px",
    textAlign: "center",
    padding: "16px 12px",
    borderBottom: "1px solid rgba(241,245,249,1)",
    verticalAlign: "middle",
    background: "rgba(255,255,255,0.54)",
  },

  tdProduct: {
    padding: "16px 18px",
    borderBottom: "1px solid rgba(241,245,249,1)",
    verticalAlign: "middle",
    minWidth: "260px",
    background: "rgba(255,255,255,0.54)",
  },

  tableIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  tableAvatar: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    color: "#2563eb",
    fontWeight: 900,
    fontSize: "12px",
    background:
      "linear-gradient(135deg, rgba(219,234,254,1) 0%, rgba(239,246,255,0.95) 100%)",
    border: "1px solid rgba(191,219,254,1)",
  },

  tableName: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 900,
    lineHeight: 1.3,
  },

  inlineTablePriceButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: 900,
    cursor: "pointer",
    textAlign: "left",
  },

  inlineTablePriceInput: {
    width: "130px",
    height: "40px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.92)",
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: 800,
  },

  tablePriceHint: {
    marginTop: "6px",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: 700,
  },

  tableActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  secondaryActionButton: {
    height: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    border: "1px solid rgba(226,232,240,1)",
    background: "rgba(248,250,252,0.95)",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
  },

  warningActionButton: {
    height: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    border: "1px solid rgba(251,191,36,0.3)",
    background: "rgba(254,252,232,0.95)",
    color: "#a16207",
    fontWeight: 800,
    cursor: "pointer",
  },

  successActionButton: {
    height: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    border: "1px solid rgba(16,185,129,0.22)",
    background: "rgba(236,253,245,0.95)",
    color: "#047857",
    fontWeight: 800,
    cursor: "pointer",
  },

  dangerActionButton: {
    height: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    border: "1px solid rgba(239,68,68,0.25)",
    background: "rgba(254,226,226,0.9)",
    color: "#b91c1c",
    fontWeight: 800,
    cursor: "pointer",
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
    marginTop: "12px",
  },

  emptyIcon: {
    width: "56px",
    height: "56px",
    margin: "0 auto 16px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(248,250,252,1) 100%)",
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

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.42)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "720px",
    borderRadius: "28px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.88) 100%)",
    border: "1px solid rgba(226,232,240,1)",
    boxShadow: "0 30px 80px rgba(15,23,42,0.18)",
    overflow: "hidden",
  },

  deleteModal: {
    width: "100%",
    maxWidth: "620px",
    borderRadius: "28px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.90) 100%)",
    border: "1px solid rgba(226,232,240,1)",
    boxShadow: "0 30px 80px rgba(15,23,42,0.18)",
    overflow: "hidden",
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    padding: "22px 22px 16px",
    borderBottom: "1px solid rgba(226,232,240,0.9)",
  },

  modalTitle: {
    color: "#0f172a",
    fontSize: "22px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },

  modalSubtitle: {
    marginTop: "6px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  modalCloseButton: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    border: "1px solid rgba(226,232,240,1)",
    background: "rgba(248,250,252,0.9)",
    color: "#334155",
    fontSize: "20px",
    cursor: "pointer",
  },

  modalBody: {
    padding: "20px 22px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
    height: "46px",
    padding: "0 14px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.88)",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 160ms ease",
  },

  checkboxField: {
    gridColumn: "1 / -1",
    paddingTop: "4px",
  },

  checkboxLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 700,
  },

  deleteWarningBox: {
    borderRadius: "18px",
    padding: "16px",
    background: "rgba(254,242,242,0.95)",
    border: "1px solid rgba(252,165,165,0.45)",
  },

  deleteWarningTitle: {
    color: "#991b1b",
    fontSize: "15px",
    fontWeight: 900,
    marginBottom: "6px",
  },

  deleteWarningText: {
    color: "#7f1d1d",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "0 22px 22px",
  },

  secondaryButton: {
    height: "42px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "1px solid rgba(226,232,240,1)",
    background: "rgba(248,250,252,0.95)",
    color: "#475569",
    fontWeight: 800,
    cursor: "pointer",
  },

  primaryButton: {
    height: "42px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "1px solid rgba(37,99,235,0.18)",
    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(37,99,235,0.18)",
  },

  dangerButton: {
    height: "42px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "1px solid rgba(239,68,68,0.3)",
    background: "linear-gradient(135deg, #dc2626, #ef4444)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(239,68,68,0.18)",
  },
};