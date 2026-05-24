import { Link, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  LayoutDashboard,
  ClipboardList,
  Utensils,
  Map,
  Settings,
  CircleHelp,
  LogOut,
  Store,
  ShieldCheck,
  Tag,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useSession } from '@/lib/auth-client';

const restaurantNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Orders', url: '/orders', icon: ClipboardList },
  { title: 'Menu', url: '/menu', icon: Utensils },
  { title: 'Delivery Zones', url: '/delivery-zones', icon: Map },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const adminNavItems = [
  { title: 'Restaurants', url: '/admin/restaurants', icon: Store },
  { title: 'Orders', url: '/admin/orders', icon: ClipboardList },
  { title: 'Promotions', url: '/admin/promotions', icon: Tag },
  { title: 'Users', url: '/admin/users', icon: Users },
];

const helpItem = { title: 'Help', url: '/help', icon: CircleHelp };

export function AppSidebar() {
  const location = useLocation();
  const { logout, isLoggingOut } = useLogout();
  const { data: session } = useSession();

  const isAdmin = (session?.user as any)?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : restaurantNavItems;
  const portalLabel = isAdmin ? 'ADMIN PORTAL' : 'MANAGEMENT PORTAL';

  return (
    <Sidebar className="bg-card">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-200">
            {isAdmin ? (
              <ShieldCheck className="h-6 w-6 text-primary" />
            ) : (
              <UtensilsCrossed className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-primary">
              SoLi Food
            </span>
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
              {portalLabel}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu className="gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={
                    isActive
                      ? 'bg-primary-200 text-primary hover:bg-primary-200 hover:text-primary'
                      : 'text-on-surface-variant'
                  }
                >
                  <Link to={item.url} className="flex items-center gap-3 py-6">
                    <item.icon
                      className={
                        isActive ? 'text-primary' : 'text-on-surface-variant'
                      }
                    />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 gap-4">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-on-surface-variant hover:bg-surface-container"
            >
              <Link to={helpItem.url} className="flex items-center gap-3">
                <helpItem.icon className="text-on-surface-variant" />
                <span className="font-medium">{helpItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              disabled={isLoggingOut}
              className="text-error hover:bg-error/10 hover:text-error focus-visible:text-error active:text-error disabled:opacity-50"
            >
              <LogOut className="text-error" />
              <span className="font-medium text-error">
                {isLoggingOut ? 'Logging out…' : 'Logout'}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
