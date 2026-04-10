export function mapDispatchLog(row) {
  return {
    id: row.id,
    productionId: row.production_id,
    actionType: row.action_type,
    fromDate: row.from_date,
    toDate: row.to_date,
    userId: row.user_id,
    meta: row.meta || {},
    createdAt: row.created_at,
  };
}