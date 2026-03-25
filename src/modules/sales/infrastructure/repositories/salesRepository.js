import { supabase } from "../../../../shared/lib/supabaseClient";
import {
  DB_TABLES,
  SALES_COLUMNS,
} from "../../../../shared/constants/database";
import { buildSelect, safeArray } from "../../../../shared/lib/queryHelpers";
import { normalizeSale } from "../../domain/entities/sale.entity";

const SALES_SELECT = buildSelect([
  SALES_COLUMNS.ID,
  SALES_COLUMNS.SALE_DATE,
  SALES_COLUMNS.CUSTOMER_NAME,
  SALES_COLUMNS.QUANTITY,
  SALES_COLUMNS.UNIT,
  SALES_COLUMNS.UNIT_PRICE,
  SALES_COLUMNS.VAT_TYPE,
  SALES_COLUMNS.VAT_RATE,
  SALES_COLUMNS.SUBTOTAL,
  SALES_COLUMNS.VAT_AMOUNT,
  SALES_COLUMNS.TOTAL_AMOUNT,
  SALES_COLUMNS.STATUS,
  SALES_COLUMNS.NOTE,
  SALES_COLUMNS.CREATED_BY,
  SALES_COLUMNS.UPDATED_BY,
  SALES_COLUMNS.PRODUCT_ID,
  "products ( name )",
]);

export const salesRepository = {
  async getAll() {
    console.log("[salesRepository.getAll] select:", SALES_SELECT);

    const { data, error } = await supabase
      .from(DB_TABLES.SALES)
      .select(SALES_SELECT)
      .order(SALES_COLUMNS.ID, { ascending: false });

    console.log("[salesRepository.getAll] raw data:", data);
    console.log("[salesRepository.getAll] raw error:", error);

    if (error) {
      throw new Error(error.message || "Satışlar alınamadı.");
    }

    const normalized = safeArray(data).map(normalizeSale);
    console.log("[salesRepository.getAll] normalized:", normalized);

    return normalized;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(DB_TABLES.SALES)
      .insert(payload)
      .select(SALES_SELECT)
      .single();

    if (error) {
      throw new Error(error.message || "Satış oluşturulamadı.");
    }

    return normalizeSale(data);
  },

  async update(saleId, payload) {
    const { data, error } = await supabase
      .from(DB_TABLES.SALES)
      .update(payload)
      .eq(SALES_COLUMNS.ID, saleId)
      .select(SALES_SELECT)
      .single();

    if (error) {
      throw new Error(error.message || "Satış güncellenemedi.");
    }

    return normalizeSale(data);
  },

  async updateStatus(saleId, nextStatus, updatedBy = null) {
    const payload = {
      [SALES_COLUMNS.STATUS]: nextStatus,
    };

    if (updatedBy) {
      payload[SALES_COLUMNS.UPDATED_BY] = updatedBy;
    }

    const { data, error } = await supabase
      .from(DB_TABLES.SALES)
      .update(payload)
      .eq(SALES_COLUMNS.ID, saleId)
      .select(SALES_SELECT)
      .single();

    if (error) {
      throw new Error(error.message || "Satış durumu güncellenemedi.");
    }

    return normalizeSale(data);
  },

  async remove(saleId) {
    const { error } = await supabase
      .from(DB_TABLES.SALES)
      .delete()
      .eq(SALES_COLUMNS.ID, saleId);

    if (error) {
      throw new Error(error.message || "Satış silinemedi.");
    }

    return true;
  },
};