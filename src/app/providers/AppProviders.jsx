import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "../../shared/constants/audit";
import { logActivity } from "../../shared/lib/audit/logActivity";
import { authRepository } from "../../modules/auth/infrastructure/authRepository";
import { usersRepository } from "../../modules/users/infrastructure/repositories/usersRepository";
import { supabase } from "../../shared/lib/supabaseClient";

const AuthContext = createContext(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30,
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
  const [profile, setProfile] = useState(null);
  const [activeOrganization, setActiveOrganization] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authBootstrapError, setAuthBootstrapError] = useState("");

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null);
      setActiveOrganization(null);
      return null;
    }

    try {
      const nextProfile = await usersRepository.getProfileByUserId(userId);

      setProfile(nextProfile);
      setActiveOrganization(
        nextProfile?.organizationId
          ? {
              id: nextProfile.organizationId,
              name: nextProfile.organizationName,
              slug: nextProfile.organizationSlug,
            }
          : null
      );

      return nextProfile;
    } catch (error) {
      console.error("Profile load error:", error);
      setProfile(null);
      setActiveOrganization(null);
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      setIsAuthLoading(true);
      setAuthBootstrapError("");

      try {
        const currentSession = await authRepository.getSession();

        if (!mounted) return;

        setSession(currentSession ?? null);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user?.id) {
          await loadProfile(currentSession.user.id);
        } else {
          setProfile(null);
          setActiveOrganization(null);
        }
      } catch (error) {
        console.error("Auth bootstrap error:", error);

        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setActiveOrganization(null);
          setAuthBootstrapError(
            error?.message || "Oturum başlatılırken beklenmeyen bir hata oluştu."
          );
        }
      } finally {
        if (mounted) {
          setIsAuthLoading(false);
        }
      }
    }

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user?.id) {
        loadProfile(nextSession.user.id).finally(() => {
          if (mounted) {
            setIsAuthLoading(false);
          }
        });
      } else {
        setProfile(null);
        setActiveOrganization(null);
        setIsAuthLoading(false);
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
      profile,
      activeOrganization,
      isAuthenticated: Boolean(session?.user),
      isAuthLoading,
      authBootstrapError,
      refreshSession: async () => {
        setIsAuthLoading(true);
        try {
          const currentSession = await authRepository.getSession();

          setSession(currentSession ?? null);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user?.id) {
            await loadProfile(currentSession.user.id);
          } else {
            setProfile(null);
            setActiveOrganization(null);
          }

          return currentSession;
        } finally {
          setIsAuthLoading(false);
        }
      },
      signOut: async () => {
        try {
          await logActivity({
            action: AUDIT_ACTIONS.LOGOUT,
            entityType: AUDIT_ENTITY_TYPES.AUTH,
            actorUserId: user?.id ?? null,
            actorEmail: user?.email ?? null,
          });
        } catch (error) {
          console.error("Logout audit error:", error);
        }

        await authRepository.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setActiveOrganization(null);
        setIsAuthLoading(false);
      },
    }),
    [session, user, profile, activeOrganization, isAuthLoading, authBootstrapError]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}