import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ToastViewport from "./ToastViewport";

const ToastContext = createContext(null);

let toastIdCounter = 1;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      description = "",
      tone = "default",
      duration = 3200,
    }) => {
      const id = toastIdCounter++;

      const nextToast = {
        id,
        title,
        description,
        tone,
        duration,
      };

      setToasts((prev) => [...prev, nextToast]);

      if (duration > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

const success = useCallback(
  (title, description = "") =>
    showToast({ title, description, tone: "success", duration: 2400 }),
  [showToast]
);

const error = useCallback(
  (title, description = "") =>
    showToast({ title, description, tone: "error", duration: 4400 }),
  [showToast]
);

const info = useCallback(
  (title, description = "") =>
    showToast({ title, description, tone: "info", duration: 3000 }),
  [showToast]
);

const warning = useCallback(
  (title, description = "") =>
    showToast({ title, description, tone: "warning", duration: 3600 }),
  [showToast]
);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      success,
      error,
      info,
      warning,
    }),
    [showToast, dismissToast, success, error, info, warning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}