import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  children,
  className = "",
  overlayClassName = "",
  panelClassName = "",
  bodyClassName = "",
  size = "lg",
  closeOnBackdrop = true,
  closeOnEscape = true,
  labelledBy,
  describedBy,
  initialFocusRef,
}) {
  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    restoreFocusRef.current = document.activeElement;
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    const focusTarget = initialFocusRef?.current || dialogRef.current;
    focusTarget?.focus?.();

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;

      const restoreTarget = restoreFocusRef.current;
      if (restoreTarget && typeof restoreTarget.focus === "function") {
        restoreTarget.focus();
      }
    };
  }, [initialFocusRef, open]);

  useEffect(() => {
    if (!open || !closeOnEscape) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeOnEscape, onClose, open]);

  if (!open) {
    return null;
  }

  function handleBackdropClick(event) {
    if (!closeOnBackdrop) {
      return;
    }

    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  return createPortal(
    <div
      className={["ui-modal", className, overlayClassName].filter(Boolean).join(" ")}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={[
          "ui-modal__dialog",
          `ui-modal__dialog--${size}`,
          panelClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={["ui-modal__body", bodyClassName].filter(Boolean).join(" ")}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
