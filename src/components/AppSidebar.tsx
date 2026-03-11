import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileJson, Eye, Inbox, Settings, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/library', label: 'Biblioteca', icon: Library },
  { to: '/builder', label: 'Builder', icon: Settings },
  { to: '/preview', label: 'Preview', icon: Eye },
  { to: '/submissions', label: 'Submissões', icon: Inbox },
  { to: '/spec-viewer', label: 'Spec JSON', icon: FileJson },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-primary tracking-tight font-display">
          FormSpec
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-0.5 font-mono">metadata-driven forms</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
