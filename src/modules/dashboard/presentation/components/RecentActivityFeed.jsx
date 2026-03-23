import { formatDateTime } from "../../../../shared/utils/date";

function getReadableAction(action) {
  const map = {
    sale_created: "Satış oluşturuldu",
    sale_updated: "Satış güncellendi",
    sale_deleted: "Satış silindi",
    sale_status_updated: "Satış durumu güncellendi",

    product_created: "Ürün oluşturuldu",
    product_updated: "Ürün güncellendi",
    product_deleted: "Ürün silindi",
    product_status_updated: "Ürün durumu güncellendi",

    user_created: "Kullanıcı oluşturuldu",
    user_updated: "Kullanıcı güncellendi",
    user_role_updated: "Kullanıcı rolü güncellendi",
    user_permissions_updated: "Kullanıcı izinleri güncellendi",
    user_status_updated: "Kullanıcı durumu güncellendi",

    login_success: "Giriş yapıldı",
    logout: "Çıkış yapıldı",
  };

  return map[action] || action;
}

export default function RecentActivityFeed({ logs = [] }) {
  if (!logs.length) {
    return <div className="helper-text">Henüz aktivite kaydı bulunmuyor.</div>;
  }

  return (
    <div className="activity-feed">
      {logs.map((log) => (
        <div key={log.id} className="activity-feed__item">
          <div className="activity-feed__top">
            <strong>{getReadableAction(log.action)}</strong>
            <span>{formatDateTime(log.created_at)}</span>
          </div>

          <div className="activity-feed__meta">
            <span>Tür: {log.entity_type}</span>
            <span>Kayıt ID: {log.entity_id || "-"}</span>
            <span>Aktör: {log.actor_email || log.actor_user_id || "-"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}