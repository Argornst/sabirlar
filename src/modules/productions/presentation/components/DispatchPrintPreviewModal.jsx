import { Printer, X } from "@phosphor-icons/react";
import Button from "../../../../shared/components/ui/Button";
import Modal from "../../../../shared/components/ui/Modal";

export function DispatchPrintPreviewModal({
  open,
  onClose,
  onPrint,
  orientation = "landscape",
  onOrientationChange,
  children,
}) {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="print-modal"
      panelClassName="print-modal__shell"
    >
      <div className="print-modal-toolbar">
        <div className="print-modal-toolbar__left">
          <h3 className="print-modal-toolbar__title">Operasyon Çıktı Önizleme</h3>
          <p className="print-modal-toolbar__subtitle">
            Yazdırılacak belgeyi önizliyorsun.
          </p>
        </div>

        <div className="print-modal-toolbar__actions">
          <div className="print-orientation-switch">
            <Button
              type="button"
              variant="ghost"
              className={`print-orientation-switch__button${
                orientation === "portrait"
                  ? " print-orientation-switch__button--active"
                  : ""
              }`}
              onClick={() => onOrientationChange?.("portrait")}
            >
              Dikey
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={`print-orientation-switch__button${
                orientation === "landscape"
                  ? " print-orientation-switch__button--active"
                  : ""
              }`}
              onClick={() => onOrientationChange?.("landscape")}
            >
              Yatay
            </Button>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={onPrint}
          >
            <Printer size={16} />
            Yazdır
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            <X size={16} />
            Kapat
          </Button>
        </div>
      </div>

      <div className={`print-preview print-preview--${orientation}`}>{children}</div>
    </Modal>
  );
}
