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
      try {
        const currentSession = await authRepository.getSession();

        if (!mounted) return;

        setSession(currentSession ?? null);
        setUser(currentSession?.user ?? null);
        setIsAuthLoading(false);

        if (currentSession?.user?.id) {
          loadProfile(currentSession.user.id);
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
      setIsAuthLoading(false);

      if (nextSession?.user?.id) {
        loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
        setActiveOrganization(null);
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
      refreshSession: async () => {
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
      },
      signOut: async () => {
        await logActivity({
          action: AUDIT_ACTIONS.LOGOUT,
          entityType: AUDIT_ENTITY_TYPES.AUTH,
          actorUserId: user?.id ?? null,
          actorEmail: user?.email ?? null,
        });

        await authRepository.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setActiveOrganization(null);
        setIsAuthLoading(false);
      },
    }),
    [session, user, profile, activeOrganization, isAuthLoading]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}