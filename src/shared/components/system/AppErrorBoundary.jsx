import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Beklenmeyen bir hata oluştu.",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-center">
          <div className="auth-card">
            <h1>Bir hata oluştu</h1>
            <p>
              Uygulama beklenmeyen bir durumla karşılaştı. Sayfayı yenileyerek
              tekrar deneyebilirsin.
            </p>

            <div className="ui-error-state" style={{ marginTop: 16 }}>
              <strong>Hata Detayı</strong>
              <span>{this.state.errorMessage}</span>
            </div>

            <div className="form-actions" style={{ marginTop: 18 }}>
              <button
                type="button"
                className="primary-button"
                onClick={this.handleReload}
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}