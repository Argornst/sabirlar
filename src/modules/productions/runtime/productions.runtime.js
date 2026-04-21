import { createDispatchLogs } from "../application/use-cases/createDispatchLogs";
import { createProduction } from "../application/use-cases/createProduction";
import { deleteProduction } from "../application/use-cases/deleteProduction";
import { getDispatchPlan } from "../application/use-cases/getDispatchPlan";
import { getProductionProductOptions } from "../application/use-cases/getProductionProductOptions";
import { getProductionsList } from "../application/use-cases/getProductionsList";
import { updateProduction } from "../application/use-cases/updateProduction";
import { PRODUCTION_PRODUCTS_DATA } from "../infrastructure/data/productionProducts.data";
import { dispatchLogRepository } from "../infrastructure/repositories/dispatchLogRepository";
import { productionsRepository } from "../infrastructure/repositories/productionsRepository";

export function listProductions(filters = {}) {
  return getProductionsList({
    productionsRepository,
    filters,
  });
}

export function listDispatchPlan(filters = {}) {
  return getDispatchPlan({
    productionsRepository,
    filters,
  });
}

export function createProductionRecord(values) {
  return createProduction({
    productionsRepository,
    values,
  });
}

export function updateProductionRecord({ id, values }) {
  return updateProduction({
    productionsRepository,
    id,
    values,
  });
}

export function deleteProductionRecord(id) {
  return deleteProduction({
    productionsRepository,
    id,
  });
}

export function listDispatchLogs(filters = {}) {
  return dispatchLogRepository.getList(filters);
}

export function createProductionDispatchLogs({ items, fromDateMap, toDate }) {
  return createDispatchLogs({
    dispatchLogRepository,
    items,
    fromDateMap,
    toDate,
  });
}

export function listProductionProductOptions() {
  return getProductionProductOptions({
    productOptions: PRODUCTION_PRODUCTS_DATA,
  });
}
