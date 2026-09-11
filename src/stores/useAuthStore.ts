import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/services/supabase/client';
import { env } from '@/lib/env';

export interface AdminProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  authError: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Constant-time generic error message to prevent user enumeration attacks
export const GENERIC_AUTH_ERROR = 'Invalid credentials or access unauthorized.';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  adminProfile: null,
  isAdmin: false,
  isLoading: true,
  isInitialized: false,
  authError: null,

  initialize: async () => {
    // If already initialized and not currently loading, return
    if (get().isInitialized && !get().isLoading) return;

    set({ isLoading: true });

    // Local dev mode without active Supabase credentials
    if (!env.isConfigured) {
      if (env.isProduction) {
        console.error('Security alert: Production environment missing Supabase credentials. Access denied.');
        set({
          user: null,
          session: null,
          adminProfile: null,
          isAdmin: false,
          isLoading: false,
          isInitialized: true,
          authError: 'Production configuration error: Authentication service is unavailable.',
        });
        return;
      }

      set({
        user: {
          id: 'dev-admin-uuid',
          email: 'admin@portfolio.local',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User,
        adminProfile: {
          id: 'dev-admin-uuid',
          email: 'admin@portfolio.local',
          role: 'superadmin',
          created_at: new Date().toISOString(),
        },
        isAdmin: true,
        isLoading: false,
        isInitialized: true,
      });
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      set({
        user: null,
        session: null,
        adminProfile: null,
        isAdmin: false,
        isLoading: false,
        isInitialized: true,
      });
      return;
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (sessionError || !session?.user) {
        set({
          user: null,
          session: null,
          adminProfile: null,
          isAdmin: false,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      // Verify the user exists in admin_profiles table
      const { data: profile, error: profileError } = await client
        .from('admin_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        // Authenticated user is not an administrator - terminate session
        console.warn('Authenticated user lacks administrator privileges.');
        await client.auth.signOut();
        set({
          user: null,
          session: null,
          adminProfile: null,
          isAdmin: false,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      set({
        user: session.user,
        session,
        adminProfile: profile as AdminProfile,
        isAdmin: true,
        isLoading: false,
        isInitialized: true,
      });

      // Subscribe to auth state changes for automatic token refresh & expiration handling
      client.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_OUT' || !newSession) {
          set({
            user: null,
            session: null,
            adminProfile: null,
            isAdmin: false,
            isLoading: false,
          });
        } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          set({
            user: newSession.user,
            session: newSession,
          });
        }
      });
    } catch {
      set({
        user: null,
        session: null,
        adminProfile: null,
        isAdmin: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, authError: null });

    // Local dev mode fallback
    if (!env.isConfigured) {
      if (env.isProduction) {
        set({
          authError: 'Production configuration error: Authentication service is unavailable.',
          isLoading: false,
        });
        return false;
      }

      set({
        user: {
          id: 'dev-admin-uuid',
          email: email || 'admin@portfolio.local',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User,
        adminProfile: {
          id: 'dev-admin-uuid',
          email: email || 'admin@portfolio.local',
          role: 'superadmin',
          created_at: new Date().toISOString(),
        },
        isAdmin: true,
        isLoading: false,
        isInitialized: true,
      });
      return true;
    }

    const client = getSupabaseClient();
    if (!client) {
      set({
        authError: GENERIC_AUTH_ERROR,
        isLoading: false,
      });
      return false;
    }

    try {
      // 1. Authenticate credentials
      const { data: authData, error: authError } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.session?.user) {
        // Return identical generic error on credential failure (anti-enumeration)
        set({
          authError: GENERIC_AUTH_ERROR,
          isLoading: false,
        });
        return false;
      }

      // 2. Authorize admin role
      const { data: profile, error: profileError } = await client
        .from('admin_profiles')
        .select('*')
        .eq('id', authData.session.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        // User exists in auth.users but has NO entry in admin_profiles
        // Immediately invalidate session and return the exact same generic error
        console.warn('Security alert: Non-admin user attempted admin login.');
        await client.auth.signOut();
        set({
          user: null,
          session: null,
          adminProfile: null,
          isAdmin: false,
          authError: GENERIC_AUTH_ERROR,
          isLoading: false,
        });
        return false;
      }

      // 3. Admin successfully authorized
      set({
        user: authData.session.user,
        session: authData.session,
        adminProfile: profile as AdminProfile,
        isAdmin: true,
        isLoading: false,
        isInitialized: true,
        authError: null,
      });

      return true;
    } catch {
      set({
        authError: GENERIC_AUTH_ERROR,
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    if (env.isConfigured) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.auth.signOut();
        } catch (err) {
          console.error('Error during signOut:', err);
        }
      }
    }

    set({
      user: null,
      session: null,
      adminProfile: null,
      isAdmin: false,
      isLoading: false,
      isInitialized: true,
      authError: null,
    });
  },

  clearError: () => set({ authError: null }),
}));
