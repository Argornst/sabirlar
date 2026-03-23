import { supabase } from "../../../../shared/lib/supabaseClient";
import {
  DB_TABLES,
  PRODUCTS_COLUMNS,
} from "../../../../shared/constants/database";
import { buildSelect, safeArray } from "../../../../shared/lib/queryHelpers";
import { normalizeProduct } from "../../domain/entities/product.entity";

const PRODUCTS_SELECT = buildSelect([
  PRODUCTS_COLUMNS.ID,
  PRODUCTS_COLUMNS.NAME,
  PRODUCTS_COLUMNS.UNIT,
  PRODUCTS_COLUMNS.UNIT_PRICE,
  PRODUCTS_COLUMNS.VAT_TYPE,
  PRODUCTS_COLUMNS.VAT_RATE,
  PRODUCTS_COLUMNS.IS_ACTIVE,
]);

export const productsRepository = {
  async getAll() {
    const { data, error } = await supabase
      .from(DB_TABLES.PRODUCTS)
      .select(PRODUCTS_SELECT)
      .order(PRODUCTS_COLUMNS.ID, { ascending: true });

    if (error) {
      throw new Error(error.message || "Ürünler alınamadı.");
    }

    return safeArray(data).map(normalizeProduct);
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(DB_TABLES.PRODUCTS)
      .insert(payload)
      .select(PRODUCTS_SELECT)
      .single();

    if (error) {
      throw new Error(error.message || "Ürün oluşturulamadı.");
    }

    return normalizeProduct(data);
  },

  async update(productId, payload) {
    const { data, error } = await supabase
      .from(DB_TABLES.PRODUCTS)
      .update(payload)
      .eq(PRODUCTS_COLUMNS.ID, productId)
      .select(PRODUCTS_SELECT)
      .single();

    if (error) {
      throw new Error(error.message || "Ürün güncellenemedi.");
    }

    return normalizeProduct(data);
  },

  async updateActiveStatus(productId, isActive) {
    const { data, error } = await supabase
      .from(DB_TABLES.PRODUCTS)
      .update({
        [PRODUCTS_COLUMNS.IS_ACTIVE]: isActive,
      })
      .eq(PRODUCTS_COLUMNS.ID, productId)
      .select(PRODUCTS_SELECT)
      .single();

    if (error) {
      throw new Error(error.message || "Ürün durumu güncellenemedi.");
    }

    return normalizeProduct(data);
  },

  async remove(productId) {
    const { error } = await supabase
      .from(DB_TABLES.PRODUCTS)
      .delete()
      .eq(PRODUCTS_COLUMNS.ID, productId);

    if (error) {
      throw new Error(error.message || "Ürün silinemedi.");
    }

    return true;
  },
};