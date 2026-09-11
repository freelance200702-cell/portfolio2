import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { env } from '@/lib/env';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Layers,
  Settings,
  LogOut,
  ArrowLeft,
  Database,
  Route as RouteIcon,
  UserCheck,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const adminProfile = useAuthStore((s) => s.adminProfile);
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[#050509] text-foreground flex flex-col md:flex-row pointer-events-auto select-none font-sans">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/[0.08] bg-[#090912] p-5 flex flex-col justify-between">
        <div>
          {/* Logo & Back to Site */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>RETURN TO 3D SITE</span>
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-tight text-white">Portfolio Admin</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant={env.isConfigured ? 'primary' : 'default'} className="text-[9px] font-mono">
                {env.isConfigured ? 'SUPABASE RLS ACTIVE' : 'LOCAL DEMO MODE'}
              </Badge>
            </div>
          </div>

          {/* Active Operator Identity */}
          {(adminProfile || user) && (
            <div className="mb-6 p-3 rounded-sm bg-black/40 border border-white/[0.06] font-mono text-xs">
              <div className="flex items-center gap-2 text-muted-foreground mb-1 text-[10px]">
                <UserCheck className="h-3 w-3 text-emerald-400" />
                <span>ACTIVE OPERATOR</span>
              </div>
              <p className="text-white text-xs truncate font-medium">
                {adminProfile?.email || user?.email || 'admin@portfolio.local'}
              </p>
              <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-sm bg-primary/10 border border-primary/30 text-primary uppercase font-semibold">
                {adminProfile?.role || 'ADMIN'}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1 font-mono text-xs">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-sm font-medium bg-primary/10 text-primary border border-primary/25"
            >
              <Layers className="h-4 w-4" />
              <span>Project Exhibits</span>
            </Link>

            <div className="flex items-center gap-3 px-3 py-2 rounded-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-not-allowed opacity-60">
              <RouteIcon className="h-4 w-4" />
              <span>Spline Sequencer</span>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 rounded-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-not-allowed opacity-60">
              <Settings className="h-4 w-4" />
              <span>Global Settings</span>
            </div>
          </nav>
        </div>

        {/* Footer / Status */}
        <div className="pt-6 border-t border-white/[0.08] mt-6">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mb-4">
            <Database className="h-3.5 w-3.5 text-primary" />
            <span>POSTGRESQL 15+ // RLS</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full gap-2 text-xs font-mono text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Terminate Session</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
