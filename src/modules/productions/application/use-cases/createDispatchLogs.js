import { insertDispatchLogs } from "../../infrastructure/repositories/dispatchLogRepository";

export async function createDispatchLogs({ items, fromDateMap, toDate }) {
  const logs = items.map((item) => ({
    production_id: item.id,
    action_type: items.length > 1 ? "bulk_move" : "move",
    from_date: fromDateMap[item.id] || null,
    to_date: toDate,
    meta: {
      lot_no: item.lot_no,
      customer_name: item.customer_name,
      product_name: item.product_name,
    },
  }));

  return insertDispatchLogs(logs);
}