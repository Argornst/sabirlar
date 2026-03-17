import { useState } from "react";

export default function LoginPage({ onLogin, authLoading, authMessage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(email, password);
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes floatCard {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <div style={styles.layout}>
        <div style={styles.heroCard}>
          <div style={styles.heroBadge}>Premium Sales Workspace</div>
          <h1 style={styles.heroTitle}>Satış kayıtlarını modern, hızlı ve kontrollü yönet.</h1>
          <p style={styles.heroText}>
            Rol bazlı erişim, güvenli kayıt yönetimi, raporlama ve audit log yapısıyla
            profesyonel satış operasyonu.
          </p>

          <div style={styles.featureGrid}>
            <Feature title="Yetkilendirme" text="Admin ve operasyon rolleri ile güvenli kullanım." />
            <Feature title="Kayıt Yönetimi" text="Satış ekleme, düzenleme, silme ve durum takibi." />
            <Feature title="Raporlama" text="Toplamlar, filtreleme ve dışa aktarma desteği." />
            <Feature title="İzlenebilirlik" text="Audit log ile işlem geçmişi takibi." />
          </div>
        </div>

        <div style={styles.formCard}>
          <div style={styles.brandRow}>
            <div style={styles.logo}>S</div>
            <div>
              <div style={styles.brandTitle}>Satış Sistemi</div>
              <div style={styles.brandSubtitle}>Yönetim paneline giriş yap</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@firma.com"
              style={styles.input}
            />

            <label style={styles.label}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />

            {authMessage ? (
              <div
                style={{
                  ...styles.message,
                  color: authMessage.toLowerCase().includes("başarılı") ? "#047857" : "#b91c1c",
                  background: authMessage.toLowerCase().includes("başarılı") ? "#ecfdf5" : "#fef2f2",
                  borderColor: authMessage.toLowerCase().includes("başarılı") ? "#a7f3d0" : "#fecaca",
                }}
              >
                {authMessage}
              </div>
            ) : null}

            <button type="submit" style={styles.button} disabled={authLoading}>
              {authLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div style={styles.featureCard}>
      <div style={styles.featureTitle}>{title}</div>
      <div style={styles.featureText}>{text}</div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(160deg, #0b1020 0%, #0f172a 35%, #eef2f7 35%, #e2e8f0 100%)",
    padding: "24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  glowOne: {
    position: "absolute",
    top: "-50px",
    left: "-20px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.16)",
    filter: "blur(80px)",
  },
  glowTwo: {
    position: "absolute",
    bottom: "-80px",
    right: "-40px",
    width: "380px",
    height: "380px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.16)",
    filter: "blur(90px)",
  },
  layout: {
    width: "100%",
    maxWidth: "1160px",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr",
    gap: "24px",
    alignItems: "stretch",
  },
  heroCard: {
    background: "rgba(8,12,22,0.78)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "32px",
    padding: "34px",
    color: "#fff",
    boxShadow: "0 30px 60px rgba(15,23,42,0.25)",
    animation: "floatCard 0.35s ease-out",
  },
  heroBadge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: 800,
    marginBottom: "18px",
  },
  heroTitle: {
    margin: "0 0 14px 0",
    fontSize: "42px",
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  heroText: {
    margin: "0 0 26px 0",
    color: "#cbd5e1",
    fontSize: "15px",
    lineHeight: 1.75,
    maxWidth: "620px",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  featureCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "22px",
    padding: "18px",
  },
  featureTitle: {
    fontSize: "15px",
    fontWeight: 800,
    marginBottom: "8px",
  },
  featureText: {
    color: "#cbd5e1",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  formCard: {
    background: "rgba(255,255,255,0.84)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.86)",
    borderRadius: "32px",
    padding: "32px",
    boxShadow: "0 30px 60px rgba(15,23,42,0.10)",
    animation: "floatCard 0.45s ease-out",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "26px",
  },
  logo: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    color: "#fff",
    fontWeight: 900,
    fontSize: "20px",
  },
  brandTitle: {
    fontSize: "19px",
    fontWeight: 900,
    color: "#0f172a",
  },
  brandSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "4px",
  },
  form: {
    display: "grid",
    gap: "12px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#334155",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "16px",
    border: "1px solid #dbe4ef",
    background: "rgba(255,255,255,0.95)",
    padding: "14px 16px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
  },
  message: {
    borderRadius: "16px",
    padding: "12px 14px",
    border: "1px solid",
    fontSize: "13px",
    fontWeight: 700,
  },
  button: {
    marginTop: "8px",
    border: "none",
    borderRadius: "18px",
    padding: "16px",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 20px 40px rgba(59,130,246,0.22)",
  },
};