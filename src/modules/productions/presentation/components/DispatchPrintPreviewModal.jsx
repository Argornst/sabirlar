import { X, Printer } from "@phosphor-icons/react";

export function DispatchPrintPreviewModal({
  open,
  onClose,
  onPrint,
  orientation = "landscape",
  onOrientationChange,
  children,
}) {
  if (!open) return null;

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  return (
    <div className="print-modal" onClick={handleBackdropClick}>
      <div className="print-modal__shell">
        <div className="print-modal-toolbar">
          <div className="print-modal-toolbar__left">
            <h3 className="print-modal-toolbar__title">Operasyon Çıktı Önizleme</h3>
            <p className="print-modal-toolbar__subtitle">
              Yazdırılacak belgeyi önizliyorsun.
            </p>
          </div>

          <div className="print-modal-toolbar__actions">
            <div className="print-orientation-switch">
              <button
                type="button"
                className={`print-orientation-switch__button${
                  orientation === "portrait"
                    ? " print-orientation-switch__button--active"
                    : ""
                }`}
                onClick={() => onOrientationChange?.("portrait")}
              >
                Dikey
              </button>

              <button
                type="button"
                className={`print-orientation-switch__button${
                  orientation === "landscape"
                    ? " print-orientation-switch__button--active"
                    : ""
                }`}
                onClick={() => onOrientationChange?.("landscape")}
              >
                Yatay
              </button>
            </div>

            <button
              type="button"
              className="dispatch-chip-button dispatch-chip-button--primary"
              onClick={onPrint}
            >
              <Printer size={16} />
              Yazdır
            </button>

            <button
              type="button"
              className="dispatch-chip-button dispatch-chip-button--ghost"
              onClick={onClose}
            >
              <X size={16} />
              Kapat
            </button>
          </div>
        </div>

        <div
          className={`print-preview print-preview--${orientation}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}