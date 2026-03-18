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
    />
  );
}