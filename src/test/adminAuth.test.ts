import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, GENERIC_AUTH_ERROR, type AdminProfile } from '@/stores/useAuthStore';
import * as supabaseClientModule from '@/services/supabase/client';
import { env } from '@/lib/env';
import type { User, Session } from '@supabase/supabase-js';

type ClientReturnType = ReturnType<typeof supabaseClientModule.getSupabaseClient>;

describe('Admin Authentication & Authorization System', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      adminProfile: null,
      isAdmin: false,
      isLoading: false,
      isInitialized: false,
      authError: null,
    });
    vi.restoreAllMocks();
  });

  describe('1. Non-Enumerating Security Policy', () => {
    it('uses a constant generic error string for all authentication failures', () => {
      expect(GENERIC_AUTH_ERROR).toBe('Invalid credentials or access unauthorized.');
    });
  });

  describe('2. Valid Login Flow', () => {
    it('authorizes valid administrator and sets active admin profile', async () => {
      // Mock Supabase client with successful auth and valid admin profile
      const mockUser: User = {
        id: 'admin-uuid-1',
        email: 'lead.admin@portfolio.dev',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      const mockSession: Session = {
        access_token: 'valid-jwt-token',
        refresh_token: 'valid-refresh-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: mockUser,
      };
      const mockProfile: AdminProfile = {
        id: 'admin-uuid-1',
        email: 'lead.admin@portfolio.dev',
        role: 'superadmin',
        created_at: new Date().toISOString(),
      };

      const mockClient = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { session: mockSession, user: mockUser },
            error: null,
          }),
          signOut: vi.fn().mockResolvedValue({ error: null }),
          getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
          onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        }),
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);
      (env as Record<string, unknown>).isConfigured = true;

      const success = await useAuthStore.getState().login('lead.admin@portfolio.dev', 'correct-password');

      expect(success).toBe(true);
      const state = useAuthStore.getState();
      expect(state.isAdmin).toBe(true);
      expect(state.user?.email).toBe('lead.admin@portfolio.dev');
      expect(state.adminProfile?.role).toBe('superadmin');
      expect(state.authError).toBeNull();
    });
  });

  describe('3. Invalid Login Flow (Anti-Enumeration)', () => {
    it('returns generic error when invalid credentials are provided', async () => {
      const mockClient = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { session: null, user: null },
            error: new Error('Invalid login credentials'),
          }),
        },
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);
      (env as Record<string, unknown>).isConfigured = true;

      const success = await useAuthStore.getState().login('attacker@unknown.com', 'wrong-pass');

      expect(success).toBe(false);
      const state = useAuthStore.getState();
      expect(state.isAdmin).toBe(false);
      expect(state.user).toBeNull();
      // Verifies no clue is leaked about invalid email vs password
      expect(state.authError).toBe(GENERIC_AUTH_ERROR);
    });
  });

  describe('4. Unauthorized Non-Admin User Flow', () => {
    it('terminates session and returns generic error if user is authenticated but not in admin_profiles', async () => {
      const mockNormalUser = {
        id: 'normal-user-uuid',
        email: 'regular.user@example.com',
      } as User;
      const mockSession = {
        access_token: 'regular-user-token',
        user: mockNormalUser,
      } as Session;

      const signOutSpy = vi.fn().mockResolvedValue({ error: null });

      const mockClient = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { session: mockSession, user: mockNormalUser },
            error: null,
          }),
          signOut: signOutSpy,
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              // User has valid auth login, but returns null from admin_profiles
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);
      (env as Record<string, unknown>).isConfigured = true;

      const success = await useAuthStore.getState().login('regular.user@example.com', 'valid-password');

      expect(success).toBe(false);
      // Immediately signs out the non-admin user
      expect(signOutSpy).toHaveBeenCalled();

      const state = useAuthStore.getState();
      expect(state.isAdmin).toBe(false);
      expect(state.user).toBeNull();
      // Crucial: Returns identical generic error so user cannot probe if an email exists
      expect(state.authError).toBe(GENERIC_AUTH_ERROR);
    });
  });

  describe('5. Session Persistence & Hydration on Refresh', () => {
    it('restores existing session on initialize and confirms admin role', async () => {
      const mockUser = {
        id: 'existing-admin-uuid',
        email: 'admin@portfolio.dev',
      } as User;
      const mockSession = {
        access_token: 'existing-valid-jwt',
        user: mockUser,
      } as Session;
      const mockProfile: AdminProfile = {
        id: 'existing-admin-uuid',
        email: 'admin@portfolio.dev',
        role: 'admin',
        created_at: new Date().toISOString(),
      };

      const mockClient = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
          onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        }),
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);
      (env as Record<string, unknown>).isConfigured = true;

      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.isAdmin).toBe(true);
      expect(state.user?.email).toBe('admin@portfolio.dev');
      expect(state.adminProfile?.role).toBe('admin');
    });
  });

  describe('6. Logout Flow', () => {
    it('clears credentials, terminates session, and resets admin state', async () => {
      const signOutSpy = vi.fn().mockResolvedValue({ error: null });
      const mockClient = {
        auth: {
          signOut: signOutSpy,
        },
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);
      (env as Record<string, unknown>).isConfigured = true;

      // Seed active admin
      useAuthStore.setState({
        isAdmin: true,
        user: { id: 'admin' } as User,
        adminProfile: { role: 'admin' } as AdminProfile,
      });

      await useAuthStore.getState().logout();

      expect(signOutSpy).toHaveBeenCalled();
      const state = useAuthStore.getState();
      expect(state.isAdmin).toBe(false);
      expect(state.user).toBeNull();
      expect(state.adminProfile).toBeNull();
      expect(state.session).toBeNull();
    });
  });

  describe('7. Expired Session Handling', () => {
    it('clears state gracefully when stored session has expired or is invalid', async () => {
      const mockClient = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);
      (env as Record<string, unknown>).isConfigured = true;

      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.isAdmin).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
