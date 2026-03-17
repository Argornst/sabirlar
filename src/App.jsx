import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { AppRouter } from "./app/router";
import { useAuth } from "./presentation/hooks/useAuth";
import { authRepository } from "./infrastructure/repositories/authRepository";
import { supabase } from "./infrastructure/supabase/client";
import { ROUTES } from "./shared/constants/routes";
import { ROLES } from "./shared/constants/roles";
import { useToast } from "./presentation/hooks/useToast";
import {
  exportSalesCsv,
  exportSalesExcel,
  exportSalesPdf,
} from "./shared/utils/exporters";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SalesPage from "./pages/SalesPage";
import NewSalePage from "./pages/NewSalePage";
import ProductsPage from "./pages/ProductsPage";
import PriceManagementPage from "./pages/PriceManagementPage";
import ReportsPage from "./pages/ReportsPage";

function todayForInput() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

function firstDayOfMonth() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export default function App() {
  const auth = useAuth();
  const toast = useToast();

  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const [priceProductId, setPriceProductId] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  const [editingSaleId, setEditingSaleId] = useState(null);
  const [saleDate, setSaleDate] = useState(todayForInput());
  const [customerName, setCustomerName] = useState("");
  const [saleProductId, setSaleProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [saleStatus, setSaleStatus] = useState("beklemede");
  const [savingSale, setSavingSale] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStartDate, setFilterStartDate] = useState(firstDayOfMonth());
  const [filterEndDate, setFilterEndDate] = useState(todayForInput());

  const session = auth.session;
  const profile = auth.profile;

  const roleName = profile?.roles?.name || "";
  const isAdmin = roleName === ROLES.ADMIN;
  const isOperasyon = roleName === ROLES.OPERATION;

  useEffect(() => {
    if (!session?.user?.id) {
      setProducts([]);
      setSales([]);
      return;
    }

    loadProducts();
    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  async function loadProducts() {
    if (!session?.user?.id) return;

    try {
      setLoadingProducts(true);

      const { data, error } = await supabase
        .from("products")
        .select("id, name, unit, unit_price, vat_type, vat_rate, is_active")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) throw error;

      const rows = data || [];
      setProducts(rows);

      if (rows.length > 0) {
        setPriceProductId((prev) => prev || String(rows[0].id));
        setNewPrice((prev) => prev || String(rows[0].unit_price ?? ""));
        setSaleProductId((prev) => prev || String(rows[0].id));
      }
    } catch (error) {
      console.error("loadProducts error:", error);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadSales() {
    if (!session?.user?.id) return;

    try {
      setLoadingSales(true);

      const { data, error } = await supabase
        .from("sales")
        .select(`
          id,
          sale_date,
          customer_name,
          quantity,
          unit,
          unit_price,
          vat_type,
          vat_rate,
          subtotal,
          vat_amount,
          total_amount,
          status,
          note,
          created_by,
          updated_by,
          product_id,
          products ( name )
        `)
        .order("id", { ascending: false });

      if (error) throw error;

      setSales(data || []);
    } catch (error) {
      console.error("loadSales error:", error);
    } finally {
      setLoadingSales(false);
    }
  }

  async function handleLogin(email, password) {
  try {
    setAuthLoading(true);
    setAuthMessage("");

    await authRepository.signIn({ email, password });

    setAuthMessage("Giriş başarılı.");
    toast.success("Giriş başarılı", "Yönetim paneline yönlendiriliyorsun.");
  } catch (error) {
    const message = error?.message || "Giriş başarısız.";
    setAuthMessage(message);
    toast.error("Giriş başarısız", message);
  } finally {
    setAuthLoading(false);
  }
}

  async function handleLogout() {
  try {
    await authRepository.signOut();
    toast.info("Çıkış yapıldı", "Oturum güvenli şekilde kapatıldı.");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Çıkış yapılamadı", error?.message || "Beklenmeyen bir hata oluştu.");
  }
}

  const selectedPriceProduct = useMemo(() => {
    return (
      products.find((p) => String(p.id) === String(priceProductId)) || null
    );
  }, [products, priceProductId]);

  const selectedSaleProduct = useMemo(() => {
    return products.find((p) => String(p.id) === String(saleProductId)) || null;
  }, [products, saleProductId]);

  const calculatedSubtotal = useMemo(() => {
    const qty = Number(quantity) || 0;
    const price = Number(selectedSaleProduct?.unit_price) || 0;
    return qty * price;
  }, [quantity, selectedSaleProduct]);

  const calculatedVatAmount = useMemo(() => {
    if (!selectedSaleProduct) return 0;
    if (selectedSaleProduct.vat_type !== "HARIC") return 0;

    const rate = Number(selectedSaleProduct.vat_rate) || 0;
    return calculatedSubtotal * (rate / 100);
  }, [selectedSaleProduct, calculatedSubtotal]);

  const calculatedTotal = useMemo(() => {
    if (!selectedSaleProduct) return 0;

    return selectedSaleProduct.vat_type === "HARIC"
      ? calculatedSubtotal + calculatedVatAmount
      : calculatedSubtotal;
  }, [selectedSaleProduct, calculatedSubtotal, calculatedVatAmount]);

  const filteredSales = useMemo(() => {
    const q = search.toLowerCase().trim();

    return sales.filter((sale) => {
      const productName = sale.products?.name || "";

      const matchesSearch =
        !q ||
        String(sale.customer_name || "").toLowerCase().includes(q) ||
        String(productName).toLowerCase().includes(q) ||
        String(sale.sale_date || "").toLowerCase().includes(q) ||
        String(sale.status || "").toLowerCase().includes(q);

      const matchesStart = !filterStartDate || sale.sale_date >= filterStartDate;
      const matchesEnd = !filterEndDate || sale.sale_date <= filterEndDate;

      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [sales, search, filterStartDate, filterEndDate]);

  const totalSalesAmount = useMemo(() => {
    return filteredSales.reduce(
      (sum, sale) => sum + Number(sale.total_amount || 0),
      0
    );
  }, [filteredSales]);

  const pendingCount = useMemo(() => {
    return filteredSales.filter((sale) => sale.status === "beklemede").length;
  }, [filteredSales]);

  const invoicedCount = useMemo(() => {
    return filteredSales.filter((sale) => sale.status === "faturalandi").length;
  }, [filteredSales]);

  function resetSaleForm() {
    setEditingSaleId(null);
    setSaleDate(todayForInput());
    setCustomerName("");
    setQuantity(1);
    setSaleStatus("beklemede");

    if (products.length > 0) {
      setSaleProductId(String(products[0].id));
    } else {
      setSaleProductId("");
    }
  }

  async function handleUpdatePrice(e) {
  e.preventDefault();

  if (!isAdmin || !session?.user?.id) return;

  const numericPrice = Number(newPrice);
  if (!numericPrice || numericPrice <= 0 || !priceProductId) {
    toast.warning("Geçersiz fiyat", "Lütfen sıfırdan büyük bir fiyat gir.");
    return;
  }

  try {
    setSavingPrice(true);

    const { error } = await supabase
      .from("products")
      .update({
        unit_price: numericPrice,
        updated_by: session.user.id,
      })
      .eq("id", priceProductId);

    if (error) throw error;

    await loadProducts();

    toast.success(
      "Fiyat güncellendi",
      `${selectedPriceProduct?.name || "Ürün"} için yeni fiyat kaydedildi.`
    );
  } catch (error) {
    console.error("handleUpdatePrice error:", error);
    toast.error(
      "Fiyat güncellenemedi",
      error?.message || "Beklenmeyen bir hata oluştu."
    );
  } finally {
    setSavingPrice(false);
  }
}

  async function handleSaveSale(e, navigate) {
  e.preventDefault();

  if (!session?.user?.id) return;

  if (!saleProductId || !customerName.trim() || !selectedSaleProduct) {
    toast.warning(
      "Eksik bilgi",
      "Müşteri adı ve ürün seçimi zorunludur."
    );
    return;
  }

  const qty = Number(quantity);
  if (!qty || qty <= 0) {
    toast.warning("Geçersiz miktar", "Lütfen geçerli bir miktar gir.");
    return;
  }

  const payload = {
    sale_date: saleDate,
    customer_name: customerName.trim().toUpperCase(),
    product_id: selectedSaleProduct.id,
    quantity: qty,
    unit: selectedSaleProduct.unit || "kg",
    unit_price: Number(selectedSaleProduct.unit_price || 0),
    vat_type: selectedSaleProduct.vat_type || "DAHIL",
    vat_rate: Number(selectedSaleProduct.vat_rate || 0),
    subtotal: calculatedSubtotal,
    vat_amount: calculatedVatAmount,
    total_amount: calculatedTotal,
    status: saleStatus,
    note: null,
    updated_by: session.user.id,
  };

  try {
    setSavingSale(true);

    if (editingSaleId && isAdmin) {
      const { error } = await supabase
        .from("sales")
        .update(payload)
        .eq("id", editingSaleId);

      if (error) throw error;

      toast.success(
        "Satış güncellendi",
        `${customerName.trim().toUpperCase()} için kayıt güncellendi.`
      );
    } else {
      const { error } = await supabase
        .from("sales")
        .insert([{ ...payload, created_by: session.user.id }]);

      if (error) throw error;

      toast.success(
        "Satış kaydedildi",
        `${customerName.trim().toUpperCase()} için yeni satış oluşturuldu.`
      );
    }

    resetSaleForm();
    await loadSales();

    if (navigate) {
      navigate(ROUTES.SALES);
    }
  } catch (error) {
    console.error("handleSaveSale error:", error);
    toast.error(
      editingSaleId ? "Satış güncellenemedi" : "Satış kaydedilemedi",
      error?.message || "Beklenmeyen bir hata oluştu."
    );
  } finally {
    setSavingSale(false);
  }
}

  function handleEditSale(sale, navigate) {
    if (!isAdmin) return;

    setEditingSaleId(sale.id);
    setSaleDate(sale.sale_date || todayForInput());
    setCustomerName(sale.customer_name || "");
    setSaleProductId(String(sale.product_id || ""));
    setQuantity(Number(sale.quantity) || 1);
    setSaleStatus(sale.status || "beklemede");

    if (navigate) {
      navigate(ROUTES.NEW_SALE);
    }
  }

  async function handleDeleteSale(id) {
  if (!isAdmin) return;

  const ok = window.confirm("Bu satış kaydını silmek istediğine emin misin?");
  if (!ok) return;

  try {
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) throw error;

    await loadSales();
    toast.success("Satış silindi", "Seçilen satış kaydı sistemden kaldırıldı.");
  } catch (error) {
    console.error("handleDeleteSale error:", error);
    toast.error(
      "Satış silinemedi",
      error?.message || "Beklenmeyen bir hata oluştu."
    );
  }
}

  async function handleStatusChange(saleId, nextStatus) {
  if (!isAdmin || !session?.user?.id) return;

  try {
    const { error } = await supabase
      .from("sales")
      .update({
        status: nextStatus,
        updated_by: session.user.id,
      })
      .eq("id", saleId);

    if (error) throw error;

    await loadSales();
    toast.success("Durum güncellendi", `Satış durumu "${nextStatus}" olarak güncellendi.`);
  } catch (error) {
    console.error("handleStatusChange error:", error);
    toast.error(
      "Durum güncellenemedi",
      error?.message || "Beklenmeyen bir hata oluştu."
    );
  }
}

  function handleExportCsv() {
  if (!filteredSales.length) {
    toast.warning("Veri yok", "Dışa aktarılacak kayıt bulunamadı.");
    return;
  }

  exportSalesCsv(filteredSales);
  toast.info("CSV hazırlandı", "Satış kayıtları CSV olarak dışa aktarıldı.");
}

async function handleExportExcel() {
  if (!filteredSales.length) {
    toast.warning("Veri yok", "Dışa aktarılacak kayıt bulunamadı.");
    return;
  }

  await exportSalesExcel(filteredSales);
  toast.info("Excel hazırlandı", "Satış kayıtları Excel olarak dışa aktarıldı.");
}

function handleExportPdf() {
  if (!filteredSales.length) {
    toast.warning("Veri yok", "Dışa aktarılacak kayıt bulunamadı.");
    return;
  }

  exportSalesPdf(filteredSales);
  toast.info("PDF hazırlandı", "Satış kayıtları PDF olarak dışa aktarıldı.");
}

  const loginElement = (
    <LoginPage
      onLogin={handleLogin}
      authLoading={authLoading}
      authMessage={authMessage}
    />
  );

  const dashboardElement = (
    <DashboardPage sales={filteredSales} loading={loadingSales} />
  );

  const salesElement = (
    <SalesPage
      filteredSales={filteredSales}
      loadingSales={loadingSales}
      isAdmin={isAdmin}
      isOperasyon={isOperasyon}
      onEditSale={handleEditSale}
      onDeleteSale={handleDeleteSale}
      onStatusChange={handleStatusChange}
    />
  );

  const newSaleElement = (
    <NewSalePage
      products={products}
      saleDate={saleDate}
      setSaleDate={setSaleDate}
      customerName={customerName}
      setCustomerName={setCustomerName}
      saleProductId={saleProductId}
      setSaleProductId={setSaleProductId}
      quantity={quantity}
      setQuantity={setQuantity}
      saleStatus={saleStatus}
      setSaleStatus={setSaleStatus}
      selectedSaleProduct={selectedSaleProduct}
      calculatedTotal={calculatedTotal}
      onSubmit={handleSaveSale}
      savingSale={savingSale}
      isAdmin={isAdmin}
      editingSaleId={editingSaleId}
    />
  );

  const productsElement = (
    <ProductsPage products={products} loadingProducts={loadingProducts} />
  );

  const priceManagementElement = isAdmin ? (
    <PriceManagementPage
      products={products}
      priceProductId={priceProductId}
      setPriceProductId={setPriceProductId}
      newPrice={newPrice}
      setNewPrice={setNewPrice}
      selectedPriceProduct={selectedPriceProduct}
      onSubmit={handleUpdatePrice}
      savingPrice={savingPrice}
    />
  ) : (
    <Navigate to={ROUTES.DASHBOARD} replace />
  );

  const reportsElement = (
    <ReportsPage
      filterStartDate={filterStartDate}
      setFilterStartDate={setFilterStartDate}
      filterEndDate={filterEndDate}
      setFilterEndDate={setFilterEndDate}
      search={search}
      setSearch={setSearch}
      filteredSales={filteredSales}
      totalSalesAmount={totalSalesAmount}
      pendingCount={pendingCount}
      invoicedCount={invoicedCount}
      onExportCsv={handleExportCsv}
      onExportExcel={handleExportExcel}
      onExportPdf={handleExportPdf}
      loadingReports={loadingSales}
    />
  );

  return (
    <AppRouter
      auth={auth}
      onLogout={handleLogout}
      loginElement={loginElement}
      dashboardElement={dashboardElement}
      salesElement={salesElement}
      newSaleElement={newSaleElement}
      productsElement={productsElement}
      priceManagementElement={priceManagementElement}
      reportsElement={reportsElement}
    />
  );
}