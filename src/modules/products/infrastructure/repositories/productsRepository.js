import { supabase } from "../../../../shared/lib/supabaseClient";
import { DB_TABLES, PRODUCTS_COLUMNS } from "../../../../shared/constants/database";
import { normalizeProduct } from "../../domain/entities/product.entity";

/* =========================================================
   GET ALL PRODUCTS
========================================================= */
async function getAll() {
  const { data, error } = await supabase
    .from(DB_TABLES.PRODUCTS)
    .select("*")
    .order(PRODUCTS_COLUMNS.NAME, { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data.map(normalizeProduct).filter(Boolean) : [];
}

/* =========================================================
   GET PRODUCTS BY IDS
========================================================= */
async function getByIds(ids) {
  if (!ids || !ids.length) return [];

  const { data, error } = await supabase
    .from(DB_TABLES.PRODUCTS)
    .select("*")
    .in(PRODUCTS_COLUMNS.ID, ids);

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data.map(normalizeProduct).filter(Boolean) : [];
}

/* =========================================================
   CREATE
========================================================= */
async function create(payload) {
  const { data, error } = await supabase
    .from(DB_TABLES.PRODUCTS)
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Ürün oluşturuldu ancak kayıt geri alınamadı.");
  }

  return normalizeProduct(data);
}

/* =========================================================
   UPDATE
========================================================= */
async function update(productId, payload) {
  if (productId == null || productId === "") {
    throw new Error("Güncellenecek ürün ID bilgisi bulunamadı.");
  }

  const { error } = await supabase
    .from(DB_TABLES.PRODUCTS)
    .update(payload)
    .eq(PRODUCTS_COLUMNS.ID, productId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: productId,
    ...payload,
  };
}

/* =========================================================
   TOGGLE ACTIVE
========================================================= */
async function updateActiveStatus(productId, isActive) {
  if (productId == null || productId === "") {
    throw new Error("Güncellenecek ürün ID bilgisi bulunamadı.");
  }

  const { error } = await supabase
    .from(DB_TABLES.PRODUCTS)
    .update({
      [PRODUCTS_COLUMNS.IS_ACTIVE]: isActive,
    })
    .eq(PRODUCTS_COLUMNS.ID, productId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: productId,
    isActive: Boolean(isActive),
  };
}

/* =========================================================
   DELETE
========================================================= */
async function remove(productId) {
  if (productId == null || productId === "") {
    throw new Error("Silinecek ürün ID bilgisi bulunamadı.");
  }

  const { error } = await supabase
    .from(DB_TABLES.PRODUCTS)
    .delete()
    .eq(PRODUCTS_COLUMNS.ID, productId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export const productsRepository = {
  getAll,
  getByIds,
  create,
  update,
  updateActiveStatus,
  remove,
};