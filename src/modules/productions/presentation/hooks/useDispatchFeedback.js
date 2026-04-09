import { useCallback, useEffect, useRef, useState } from "react";

export function useDispatchFeedback() {
  const toastIdRef = useRef(0);
  const timersRef = useRef(new Map());
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);

    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({
      type = "success",
      title = "",
      message = "",
      duration = 3200,
    }) => {
      toastIdRef.current += 1;
      const id = `dispatch-toast-${toastIdRef.current}`;

      setToasts((prev) => [
        ...prev,
        {
          id,
          type,
          title,
          message,
        },
      ]);

      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, duration);

      timersRef.current.set(id, timer);

      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return {
    toasts,
    pushToast,
    dismissToast,
  };
}