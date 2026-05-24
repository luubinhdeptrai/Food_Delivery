import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  Store,
  ClipboardList,
  Tag,
  Users,
  LogOut,
} from 'lucide-react';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useSession } from '@/lib/auth-client';

const navItems = [
  { title: 'Restaurants', url: '/restaurants', icon: Store },
  { title: 'Orders', url: '/orders', icon: ClipboardList },
  { title: 'Promotions', url: '/promotions', icon: Tag },
  { title: 'Users', url: '/users', icon: Users },
];

export function AdminSidebar() {
  const { logout, isLoggingOut } = useLogout();
  const { data: session } = useSession();
  const email = session?.user?.email ?? '';
  const name = session?.user?.name ?? 'Admin';

  return (
    <aside className="w-64 shrink-0 bg-card border-r flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-200">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-primary">
              SoLi Admin
            </span>
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
              ADMIN PORTAL
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.url}>
              <NavLink
                to={item.url}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-200 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User + logout */}
      <div className="border-t p-4 space-y-2">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-on-surface truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
        <button
          onClick={logout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 disabled:opacity-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>{isLoggingOut ? 'Signing out…' : 'Sign out'}</span>
        </button>
      </div>
    </aside>
  );
}
