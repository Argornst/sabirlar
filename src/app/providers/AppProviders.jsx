import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usersRepository } from "../../modules/users/infrastructure/repositories/usersRepository";
import { supabase } from "../../shared/lib/supabaseClient";

const AuthContext = createContext(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
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

    const hardFallback = setTimeout(() => {
      if (mounted) {
        setIsAuthLoading(false);
      }
    }, 6000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;

      try {
        setSession(nextSession ?? null);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user?.id) {
          await loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
          setActiveOrganization(null);
        }
      } catch (error) {
        console.error("onAuthStateChange error:", error);
        setProfile(null);
        setActiveOrganization(null);
      } finally {
        if (mounted) {
          setIsAuthLoading(false);
        }
      }
    });

    async function bootstrap() {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

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
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setProfile(null);
        setActiveOrganization(null);
      } finally {
        if (mounted) {
          setIsAuthLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
      clearTimeout(hardFallback);
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
        setIsAuthLoading(true);

        try {
          const {
            data: { session: currentSession },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          setSession(currentSession ?? null);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user?.id) {
            await loadProfile(currentSession.user.id);
          } else {
            setProfile(null);
            setActiveOrganization(null);
          }

          return currentSession ?? null;
        } catch (error) {
          console.error("refreshSession error:", error);
          return null;
        } finally {
          setIsAuthLoading(false);
        }
      },
      signOut: async () => {
        await supabase.auth.signOut();
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