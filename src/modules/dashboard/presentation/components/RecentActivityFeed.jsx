import { formatDateTime } from "../../../../shared/utils/date";

function getReadableAction(action) {
  const map = {
    sale_created: "Satış oluşturuldu",
    sale_updated: "Satış güncellendi",
    product_created: "Ürün oluşturuldu",
    user_created: "Kullanıcı oluşturuldu",
    login_success: "Giriş yapıldı",
    logout: "Çıkış yapıldı",
  };

  return map[action] || action;
}

export default function RecentActivityFeed({ logs = [] }) {
  if (!logs.length) {
    return <div className="helper-text">Henüz aktivite yok</div>;
  }

  return (
    <div className="activity-feed activity-feed--premium">
      {logs.map((log) => (
        <div key={log.id} className="activity-feed__item activity-feed__item--premium">
          <div className="activity-feed__dot" />

          <div className="activity-feed__content">
            <div className="activity-feed__top">
              <strong>{getReadableAction(log.action)}</strong>
              <span>{formatDateTime(log.created_at)}</span>
            </div>

            <div className="activity-feed__meta">
              <span>{log.entity_type || "-"}</span>
              <span>{log.actor_email || "-"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}