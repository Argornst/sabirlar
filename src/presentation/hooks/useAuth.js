import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentSession } from "../../application/auth/getCurrentSession";
import { authRepository } from "../../infrastructure/repositories/authRepository";

export function useAuth() {
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const [state, setState] = useState({
    session: null,
    profile: null,
    initialLoading: true,
    refreshing: false,
    error: null,
  });

  const loadAuth = useCallback(async ({ silent = false } = {}) => {
    try {
      setState((prev) => ({
        ...prev,
        initialLoading: silent ? prev.initialLoading : !initializedRef.current,
        refreshing: silent ? initializedRef.current : false,
        error: null,
      }));

      const result = await getCurrentSession();

      if (!mountedRef.current) return;

      initializedRef.current = true;

      setState({
        session: result.session,
        profile: result.profile,
        initialLoading: false,
        refreshing: false,
        error: null,
      });
    } catch (error) {
      if (!mountedRef.current) return;

      initializedRef.current = true;

      setState((prev) => ({
        ...prev,
        session: null,
        profile: null,
        initialLoading: false,
        refreshing: false,
        error: error?.message || "Oturum bilgisi alınamadı.",
      }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    loadAuth();

    const {
      data: { subscription },
    } = authRepository.onAuthStateChange(() => {
      loadAuth({ silent: true });
    });

    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [loadAuth]);

  return {
    session: state.session,
    profile: state.profile,
    loading: state.initialLoading,
    refreshing: state.refreshing,
    error: state.error,
    reloadAuth: loadAuth,
  };
}