import { formatDate } from "../../../../shared/utils/date";

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

function getActivityMeta(action) {
  const map = {
    sale_created: {
      tone: "success",
      label: "Satış",
      icon: SaleCreatedIcon,
    },
    sale_updated: {
      tone: "warning",
      label: "Güncelleme",
      icon: EditIcon,
    },
    product_created: {
      tone: "default",
      label: "Ürün",
      icon: ProductIcon,
    },
    user_created: {
      tone: "default",
      label: "Kullanıcı",
      icon: UserIcon,
    },
    login_success: {
      tone: "success",
      label: "Oturum",
      icon: LoginIcon,
    },
    logout: {
      tone: "danger",
      label: "Çıkış",
      icon: LogoutIcon,
    },
  };

  return (
    map[action] || {
      tone: "default",
      label: "Aktivite",
      icon: ActivityIcon,
    }
  );
}

export default function RecentActivityFeed({ logs = [] }) {
  if (!logs.length) {
    return <div className="helper-text">Henüz aktivite yok</div>;
  }

  return (
    <div className="activity-feed activity-feed--premium">
      {logs.map((log) => {
        const meta = getActivityMeta(log.action);
        const Icon = meta.icon;

        return (
          <div
            key={log.id}
            className={`activity-feed__item activity-feed__item--premium activity-feed__item--tone-${meta.tone}`}
          >
            <div className="activity-feed__line" />

            <div className="activity-feed__icon">
              <Icon />
            </div>

            <div className="activity-feed__content">
              <div className="activity-feed__top">
                <div className="activity-feed__title-block">
                  <strong>{getReadableAction(log.action)}</strong>
                  <span className="activity-feed__badge">{meta.label}</span>
                </div>

                <span>{formatDate(log.created_at)}</span>
              </div>

              <div className="activity-feed__meta">
                <span>
                  <strong>Tür:</strong> {log.entity_type || "-"}
                </span>
                <span>
                  <strong>Aktör:</strong> {log.actor_email || "-"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h3l2.2-5 3.6 10L16 12h3" />
    </svg>
  );
}

function SaleCreatedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5h16" />
      <path d="M7 16v-4.5" />
      <path d="M12 16V7" />
      <path d="M17 16v-6.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4 20 4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20Z" />
      <path d="m13.8 6.8 3.4 3.4" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 21 8-4.5v-8L12 4 4 8.5v8L12 21Z" />
      <path d="M12 21v-8" />
      <path d="m4 8.5 8 4.5 8-4.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 18.5a4.5 4.5 0 0 0-9 0" />
      <circle cx="12" cy="8.5" r="3.2" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 20h-3a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h3" />
      <path d="M14 16l4-4-4-4" />
      <path d="M18 12H9" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 20h-3a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h3" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}