import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authRepository } from "../../modules/auth/infrastructure/authRepository";
import { supabase } from "../../shared/lib/supabaseClient";

const AuthContext = createContext(null);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: 0,
      staleTime: 1000 * 60 * 3,
      gcTime: 1000 * 60 * 10,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AppProviders");
  }

  return context;
}

export default function AppProviders({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const currentSession = await authRepository.getSession();

        if (!mounted) return;

        setSession(currentSession ?? null);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user?.id) {
          queryClient.invalidateQueries({ queryKey: ["current-user"] });
        } else {
          queryClient.removeQueries({ queryKey: ["current-user"] });
        }
      } catch (error) {
        console.error("Auth bootstrap error:", error);

        if (!mounted) return;

        setSession(null);
        setUser(null);
        queryClient.removeQueries({ queryKey: ["current-user"] });
      } finally {
        if (mounted) {
          setIsSessionReady(true);
        }
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setIsSessionReady(true);

      if (nextSession?.user?.id) {
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
      } else {
        queryClient.removeQueries({ queryKey: ["current-user"] });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      isAuthenticated: Boolean(session?.user),
      isAuthLoading: !isSessionReady,
      refreshSession: async () => {
        try {
          const currentSession = await authRepository.getSession();

          setSession(currentSession ?? null);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user?.id) {
            await queryClient.invalidateQueries({ queryKey: ["current-user"] });
          } else {
            queryClient.removeQueries({ queryKey: ["current-user"] });
          }

          return currentSession ?? null;
        } catch (error) {
          console.error("Refresh session error:", error);
          setSession(null);
          setUser(null);
          queryClient.removeQueries({ queryKey: ["current-user"] });
          return null;
        }
      },
      signOut: async () => {
        await authRepository.signOut();
        setSession(null);
        setUser(null);
        setIsSessionReady(true);
        queryClient.clear();
      },
    }),
    [session, user, isSessionReady]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}