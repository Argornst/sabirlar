import { useState } from "react";
import loginLogo from "../assets/logo-login.png";

export default function LoginPage({
  onLogin,
  authLoading = false,
  authMessage = "",
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    await onLogin(username, password);
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-16px) translateX(8px); }
          100% { transform: translateY(0px) translateX(0px); }
        }

        @keyframes pulseSoft {
          0% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
          100% { opacity: 0.45; transform: scale(1); }
        }

        @keyframes shimmerMove {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }

        @keyframes gridDrift {
          0% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(8px,-10px,0); }
          100% { transform: translate3d(0,0,0); }
        }

        @media (max-width: 980px) {
          .login-layout {
            grid-template-columns: 1fr !important;
          }

          .login-showcase {
            display: none !important;
          }
        }
      `}</style>

      <div style={styles.bgBase} />
      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />
      <div style={styles.bgGlowThree} />
      <div style={styles.bgGrid} />

      <div className="login-layout" style={styles.layout}>
        <div className="login-showcase" style={styles.showcase}>
          <div style={styles.logoStage}>
            <img
              src={loginLogo}
              alt="Sabırlar Logo"
              style={styles.showcaseLogo}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = document.getElementById("showcase-logo-fallback");
                if (fallback) fallback.style.display = "grid";
              }}
            />
            <div id="showcase-logo-fallback" style={styles.showcaseLogoFallback}>
              SABIRLAR
            </div>
          </div>
        </div>

        <div style={styles.cardWrap}>
          <div style={styles.cardGlow} />
          <div style={styles.card}>
            <div style={styles.topBadge}>YÖNETİM PANELİ</div>

            <div style={styles.headingWrap}>
              <h2 style={styles.title}>Hoş geldin</h2>
              <p style={styles.subtitle}>
                Kullanıcı adın ve şifren ile sisteme güvenli giriş yap.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label} htmlFor="login-username">
                  Kullanıcı Adı
                </label>
                <div style={styles.inputShell}>
                  <span style={styles.inputPrefix}>@</span>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ornek: adil"
                    style={styles.input}
                    autoComplete="username"
                    disabled={authLoading}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="login-password">
                  Şifre
                </label>
                <div style={styles.inputShell}>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifreni gir"
                    style={styles.inputFull}
                    autoComplete="current-password"
                    disabled={authLoading}
                  />
                </div>
              </div>

              {authMessage ? <div style={styles.message}>{authMessage}</div> : null}

              <button type="submit" style={styles.button} disabled={authLoading}>
                <span style={styles.buttonShine} />
                {authLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </form>

            <div style={styles.footerText}>
              Sabırlar yönetim sistemi • güvenli oturum
            </div>
          </div>
        </div>
      </div>
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
    padding: "24px",
    background: "#07111f",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  bgBase: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(59,130,246,0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(16,185,129,0.08), transparent 30%), linear-gradient(180deg, #06101d 0%, #0b1324 45%, #111827 100%)",
  },
  bgGlowOne: {
    position: "absolute",
    top: "-80px",
    left: "-40px",
    width: "360px",
    height: "360px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.28)",
    filter: "blur(110px)",
    animation: "floatSlow 9s ease-in-out infinite",
  },
  bgGlowTwo: {
    position: "absolute",
    right: "-100px",
    top: "10%",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.20)",
    filter: "blur(100px)",
    animation: "pulseSoft 8s ease-in-out infinite",
  },
  bgGlowThree: {
    position: "absolute",
    bottom: "-120px",
    left: "30%",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(139,92,246,0.16)",
    filter: "blur(110px)",
    animation: "floatSlow 11s ease-in-out infinite",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    opacity: 0.18,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
    `,
    backgroundSize: "38px 38px",
    maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.2))",
    animation: "gridDrift 10s ease-in-out infinite",
  },

  layout: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "1240px",
    display: "grid",
    gridTemplateColumns: "1fr 0.9fr",
    gap: "28px",
    alignItems: "center",
  },

  showcase: {
    minHeight: "620px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 10px 20px 8px",
  },
 logoStage: {
  width: "480px",
  height: "260px", // biraz daha nefes veriyoruz
  display: "grid",
  alignItems: "center",
  justifyItems: "start",
},

showcaseLogo: {
  width: "320px",
  height: "auto",
  objectFit: "contain",
  display: "block",
  filter: "drop-shadow(0 10px 30px rgba(59,130,246,0.25))",
},
  showcaseLogoFallback: {
    display: "none",
    width: "420px",
    height: "180px",
    alignItems: "center",
    justifyContent: "start",
    color: "#ffffff",
    fontSize: "64px",
    fontWeight: 900,
    letterSpacing: "-0.06em",
  },

  cardWrap: {
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    inset: "-20px",
    background:
      "radial-gradient(circle at top right, rgba(59,130,246,0.20), transparent 35%), radial-gradient(circle at bottom left, rgba(16,185,129,0.18), transparent 32%)",
    filter: "blur(22px)",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "500px",
    marginLeft: "auto",
    background: "rgba(255,255,255,0.10)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "32px",
    padding: "28px",
    boxShadow: "0 30px 70px rgba(0,0,0,0.30)",
  },
  topBadge: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#bfdbfe",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.08em",
    marginBottom: "20px",
  },

  headingWrap: {
    marginBottom: "18px",
  },
  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "38px",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    lineHeight: 1.02,
  },
  subtitle: {
    margin: "12px 0 0 0",
    color: "rgba(226,232,240,0.78)",
    fontSize: "14px",
    lineHeight: 1.8,
  },

  form: {
    display: "grid",
    gap: "16px",
    marginTop: "18px",
  },
  field: {
    display: "grid",
    gap: "8px",
  },
  label: {
    color: "#e2e8f0",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.01em",
  },
  inputShell: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  inputPrefix: {
    paddingLeft: "16px",
    color: "#93c5fd",
    fontSize: "15px",
    fontWeight: 900,
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    background: "transparent",
    color: "#ffffff",
    outline: "none",
    fontSize: "14px",
    padding: "15px 16px 15px 10px",
  },
  inputFull: {
    flex: 1,
    minWidth: 0,
    border: "none",
    background: "transparent",
    color: "#ffffff",
    outline: "none",
    fontSize: "14px",
    padding: "15px 16px",
  },
  message: {
    padding: "12px 14px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    fontSize: "13px",
    lineHeight: 1.6,
  },
 button: {
  position: "relative",
  overflow: "hidden",
  marginTop: "6px",
  border: "none",
  borderRadius: "18px",
  padding: "16px 18px",
  background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
  color: "#ffffff",
  fontWeight: 900,
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 18px 36px rgba(59,130,246,0.24)",
  transition: "transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease",
},
  buttonShine: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(100deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 80%)",
    animation: "shimmerMove 3.6s linear infinite",
    pointerEvents: "none",
  },
  footerText: {
    marginTop: "16px",
    color: "rgba(226,232,240,0.54)",
    fontSize: "12px",
    textAlign: "center",
    letterSpacing: "0.04em",
  },
};