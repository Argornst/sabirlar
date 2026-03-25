import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authRepository } from "../../modules/auth/infrastructure/authRepository";
import { usersRepository } from "../../modules/users/infrastructure/repositories/usersRepository";
import { supabase } from "../../shared/lib/supabaseClient";

const AuthContext = createContext(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
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

function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), ms);
  });
}

async function getSessionSafely() {
  try {
    const result = await Promise.race([
      authRepository.getSession(),
      timeout(2500),
    ]);

    return result ?? null;
  } catch (error) {
    console.error("getSessionSafely error:", error);
    return null;
  }
}

export default function AppProviders({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeOrganization, setActiveOrganization] = useState(null);

  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null);
      setActiveOrganization(null);
      return null;
    }

    setIsProfileLoading(true);

    try {
      const nextProfile = await Promise.race([
        usersRepository.getProfileByUserId(userId),
        timeout(2500),
      ]);

      if (!nextProfile) {
        setProfile(null);
        setActiveOrganization(null);
        return null;
      }

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
    } finally {
      setIsProfileLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const currentSession = await getSessionSafely();

      if (!mounted) return;

      setSession(currentSession ?? null);
      setUser(currentSession?.user ?? null);
      setIsSessionReady(true);

      if (currentSession?.user?.id) {
        await loadProfile(currentSession.user.id);
      } else {
        setProfile(null);
        setActiveOrganization(null);
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
        await loadProfile(nextSession.user.id);
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
      isAuthLoading: !isSessionReady,
      isProfileLoading,
      refreshSession: async () => {
        setIsSessionReady(false);

        const currentSession = await getSessionSafely();

        setSession(currentSession ?? null);
        setUser(currentSession?.user ?? null);
        setIsSessionReady(true);

        if (currentSession?.user?.id) {
          await loadProfile(currentSession.user.id);
        } else {
          setProfile(null);
          setActiveOrganization(null);
        }

        return currentSession ?? null;
      },
      signOut: async () => {
        await authRepository.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setActiveOrganization(null);
        setIsSessionReady(true);
        setIsProfileLoading(false);
      },
    }),
    [session, user, profile, activeOrganization, isSessionReady, isProfileLoading]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}