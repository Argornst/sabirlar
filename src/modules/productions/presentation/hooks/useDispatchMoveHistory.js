import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "productions.dispatch.move.history";
const MAX_HISTORY_ITEMS = 24;

function readHistory() {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error("Dispatch history read error:", error);
    return [];
  }
}

export function useDispatchMoveHistory() {
  const [history, setHistory] = useState(() => readHistory());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Dispatch history write error:", error);
    }
  }, [history]);

  const actions = useMemo(
    () => ({
      append(entry) {
        setHistory((prev) => {
          const nextHistory = [
            {
              id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              createdAt: entry.createdAt || new Date().toISOString(),
              ...entry,
            },
            ...prev,
          ];

          return nextHistory.slice(0, MAX_HISTORY_ITEMS);
        });
      },

      clear() {
        setHistory([]);
      },
    }),
    []
  );

  return {
    history,
    appendHistoryEntry: actions.append,
    clearHistory: actions.clear,
  };
}