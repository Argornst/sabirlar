import { supabase } from "../../../../shared/lib/supabaseClient";
import { DB_TABLES } from "../../../../shared/constants/database";

/* =========================================================
   GET ALL PRODUCTS
========================================================= */

async function getAll() {
  const { data, error } = await supabase
    .from(DB_TABLES.PRODUCTS)
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/* =========================================================
   GET PRODUCTS BY IDS (NEW - CRITICAL)
========================================================= */

async function getByIds(ids) {
  if (!ids || !ids.length) return [];

  const { data, error } = await supabase
    .from(DB_TABLES.PRODUCTS)
    .select("*")
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/* =========================================================
   EXPORT
========================================================= */

export const productsRepository = {
  getAll,
  getByIds,
};