import IconButton from "../../../../shared/components/ui/IconButton";

export function DispatchToastViewport({ toasts, onDismiss }) {
  if (!Array.isArray(toasts) || !toasts.length) return null;

  return (
    <div className="dispatch-toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "dispatch-toast",
            `dispatch-toast--${toast.type || "success"}`,
          ].join(" ")}
        >
          <div className="dispatch-toast__content">
            <strong>{toast.title}</strong>
            {toast.message ? <p>{toast.message}</p> : null}
          </div>

          <IconButton
            type="button"
            className="dispatch-toast__close"
            onClick={() => onDismiss?.(toast.id)}
            aria-label="Bildirimi kapat"
          >
            ×
          </IconButton>
        </div>
      ))}
    </div>
  );
}
