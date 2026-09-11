import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { env } from '@/lib/env';
import { Heading, Paragraph, MonoLabel } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Shield, KeyRound, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const authError = useAuthStore((s) => s.authError);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initialize = useAuthStore((s) => s.initialize);
  const clearError = useAuthStore((s) => s.clearError);

  // Retrieve previous target location or default to /admin
  const fromLocation = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin';

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // If already authorized, seamlessly redirect to destination
  useEffect(() => {
    if (isInitialized && isAdmin) {
      navigate(fromLocation, { replace: true });
    }
  }, [isInitialized, isAdmin, navigate, fromLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(email, password);
    if (success) {
      navigate(fromLocation, { replace: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050509] p-4 sm:p-6 select-none pointer-events-auto">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)] pointer-events-none" />

      <Card className="max-w-md w-full p-6 sm:p-8 border border-white/[0.08] bg-[#090912]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative z-10">
        {/* Return to 3D Expedition */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>RETURN TO 3D EXPEDITION</span>
        </Link>

        {/* Header Badge & Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary border border-primary/25">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <MonoLabel className="text-[10px] tracking-widest text-primary/80">
              RESTRICTED ACCESS PORTAL
            </MonoLabel>
            <Heading level={2} className="text-xl font-bold tracking-tight text-white">
              Administrator Verification
            </Heading>
          </div>
        </div>

        {/* Local Demo Mode Notice */}
        {!env.isConfigured && (
          <div className="mb-6 p-3 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="leading-relaxed">
              <span className="font-semibold block mb-0.5">DEV DEMO ENVIRONMENT</span>
              Supabase credentials not detected. Demo authentication is active. Click sign-in to enter directly.
            </div>
          </div>
        )}

        {/* Security Alert (Unified constant-time message) */}
        {authError && (
          <div
            role="alert"
            className="mb-6 p-3.5 rounded-sm bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5 font-mono animate-in fade-in"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            <div className="leading-relaxed">
              <span className="font-semibold block mb-0.5 text-red-300">ACCESS DENIED</span>
              {authError}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">
              Operator Identifier
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@portfolio.dev"
              autoComplete="username"
              className="w-full px-3.5 py-2.5 rounded-sm bg-black/60 border border-white/[0.1] text-foreground text-sm font-mono focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/40"
              required={env.isConfigured}
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">
              Cryptographic Passphrase
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-sm bg-black/60 border border-white/[0.1] text-foreground text-sm font-mono focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/40 pr-10"
                required={env.isConfigured}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full gap-2 mt-4 py-2.5 text-xs shadow-[0_0_20px_rgba(56,189,248,0.2)]"
            disabled={isLoading}
          >
            <KeyRound className="h-4 w-4" />
            <span>
              {isLoading
                ? 'AUTHENTICATING TOKEN...'
                : env.isConfigured
                ? 'AUTHORIZE ACCESS'
                : 'ENTER DEMO CMS'}
            </span>
          </Button>
        </form>

        {/* Security Classification Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
          <Paragraph className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">
            ZERO-TRUST ARCHITECTURE // RLS PROTECTED // NO ENUMERATION
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};
