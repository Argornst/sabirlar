import { useEffect, useMemo, useState } from "react";
import { AppRouter } from "./app/router";
import { useAuth } from "./presentation/hooks/useAuth";
import { authRepository } from "./infrastructure/repositories/authRepository";
import { supabase } from "./infrastructure/supabase/client";
import { ROLES } from "./shared/constants/roles";
import { useToast } from "./presentation/hooks/useToast";
import { usersRepository } from "./infrastructure/repositories/usersRepository";
import { adminUsersRepository } from "./infrastructure/repositories/adminUsersRepository";
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
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";

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

function getSaleFlags(status) {
  switch (status) {
    case "odendi":
      return { paid: true, invoiced: false };
    case "faturalandi":
      return { paid: false, invoiced: true };
    case "odendi_faturalandi":
      return { paid: true, invoiced: true };
    case "beklemede":
    default:
      return { paid: false, invoiced: false };
  }
}

function buildSaleStatus({ paid, invoiced }) {
  if (paid && invoiced) return "odendi_faturalandi";
  if (paid) return "odendi";
  if (invoiced) return "faturalandi";
  return "beklemede";
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
  }, [session?.user?.id]);

  async function loadProducts() {
    if (!session?.user?.id) return;

    try {
      setLoadingProducts(true);

      const { data, error } = await supabase
        .from("products")
        .select("id, name, unit, unit_price, vat_type, vat_rate, is_active")
        .order("id", { ascending: true });

      if (error) throw error;

      const rows = data || [];
      setProducts(rows);

      if (rows.length > 0) {
        setSaleProductId((prev) => prev || String(rows[0].id));
      }
    } catch (error) {
      console.error("loadProducts error:", error);
      toast.error("Ürünler yüklenemedi", error?.message || "Beklenmeyen hata");
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
      toast.error("Satışlar yüklenemedi", error?.message || "Beklenmeyen hata");
    } finally {
      setLoadingSales(false);
    }
  }

async function handleLogin(loginInput, password) {
  try {
    setAuthLoading(true);
    setAuthMessage("");

    const normalizedLogin = String(loginInput || "").trim().toLowerCase();

    if (!normalizedLogin) {
      throw new Error("Kullanıcı adı veya e-posta gerekli.");
    }

    if (!password) {
      throw new Error("Şifre gerekli.");
    }

    let emailToUse = normalizedLogin;

    if (!normalizedLogin.includes("@")) {
      const lookup = await adminUsersRepository.lookupLoginUsername(
        normalizedLogin
      );

      if (!lookup?.email) {
        throw new Error("Kullanıcı bulunamadı.");
      }

      if (lookup?.is_active === false) {
        throw new Error("Bu hesap pasif durumda.");
      }

      emailToUse = lookup.email;
    }

    await authRepository.signIn({
      email: emailToUse,
      password,
    });

    setAuthMessage("Giriş başarılı.");
    toast.success("Giriş başarılı", "Yönetim paneline yönlendiriliyorsun.");
  } catch (error) {
    const rawMessage = error?.message || "Giriş başarısız.";
    let message = rawMessage;

    if (
      rawMessage.toLowerCase().includes("invalid login credentials") ||
      rawMessage.toLowerCase().includes("invalid credentials")
    ) {
      message = "Kullanıcı adı/e-posta veya şifre yanlış.";
    }

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
        String(productName).toLowerCase().includes(q);

      const matchesStart = !filterStartDate || sale.sale_date >= filterStartDate;
      const matchesEnd = !filterEndDate || sale.sale_date <= filterEndDate;

      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [sales, search, filterStartDate, filterEndDate]);

  function updateSaleStatusInState(saleId, nextStatus) {
    setSales((prev) =>
      prev.map((sale) =>
        sale.id === saleId
          ? {
              ...sale,
              status: nextStatus,
            }
          : sale
      )
    );
  }

  async function handleTogglePaid(sale) {
    const previousStatus = sale.status;
    const flags = getSaleFlags(sale.status);
    const nextStatus = buildSaleStatus({
      paid: !flags.paid,
      invoiced: flags.invoiced,
    });

    updateSaleStatusInState(sale.id, nextStatus);

    try {
      const { error } = await supabase
        .from("sales")
        .update({
          status: nextStatus,
          updated_by: session?.user?.id || null,
        })
        .eq("id", sale.id);

      if (error) throw error;

      toast.success("Satış güncellendi", "Ödeme durumu güncellendi.");
    } catch (error) {
      console.error("handleTogglePaid error:", error);
      updateSaleStatusInState(sale.id, previousStatus);
      toast.error("Güncelleme başarısız", error?.message || "Beklenmeyen hata");
    }
  }

  async function handleToggleInvoiced(sale) {
    const previousStatus = sale.status;
    const flags = getSaleFlags(sale.status);
    const nextStatus = buildSaleStatus({
      paid: flags.paid,
      invoiced: !flags.invoiced,
    });

    updateSaleStatusInState(sale.id, nextStatus);

    try {
      const { error } = await supabase
        .from("sales")
        .update({
          status: nextStatus,
          updated_by: session?.user?.id || null,
        })
        .eq("id", sale.id);

      if (error) throw error;

      toast.success("Satış güncellendi", "Fatura durumu güncellendi.");
    } catch (error) {
      console.error("handleToggleInvoiced error:", error);
      updateSaleStatusInState(sale.id, previousStatus);
      toast.error("Güncelleme başarısız", error?.message || "Beklenmeyen hata");
    }
  }

  function handleEditSale(sale, navigate) {
    setEditingSaleId(sale.id);
    setSaleDate(sale.sale_date || todayForInput());
    setCustomerName(sale.customer_name || "");
    setSaleProductId(String(sale.product_id || ""));
    setQuantity(Number(sale.quantity) || 1);
    setSaleStatus(sale.status || "beklemede");
    navigate("/new-sale");
  }

  async function handleDeleteSale(saleId) {
    const confirmed = window.confirm("Bu satış kaydını silmek istediğine emin misin?");
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("sales").delete().eq("id", saleId);
      if (error) throw error;

      setSales((prev) => prev.filter((sale) => sale.id !== saleId));
      toast.success("Satış silindi", "Kayıt başarıyla kaldırıldı.");
    } catch (error) {
      console.error("handleDeleteSale error:", error);
      toast.error("Silme başarısız", error?.message || "Beklenmeyen hata");
    }
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

  const usersElement = <UsersPage />;

  const salesElement = (
    <SalesPage
      filteredSales={filteredSales}
      loadingSales={loadingSales}
      isAdmin={isAdmin}
      isOperasyon={isOperasyon}
      onEditSale={handleEditSale}
      onDeleteSale={handleDeleteSale}
      onTogglePaid={handleTogglePaid}
      onToggleInvoiced={handleToggleInvoiced}
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
      savingSale={savingSale}
      isAdmin={isAdmin}
      editingSaleId={editingSaleId}
      onSalesRefresh={loadSales}
      setEditingSaleId={setEditingSaleId}
      setSaleStatusExternal={setSaleStatus}
    />
  );

  const productsElement = (
    <ProductsPage
      products={products}
      loadingProducts={loadingProducts}
      onProductsRefresh={loadProducts}
    />
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
      onExportCsv={exportSalesCsv}
      onExportExcel={exportSalesExcel}
      onExportPdf={exportSalesPdf}
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
      reportsElement={reportsElement}
      usersElement={usersElement}
    />
  );
}