'use client';

import { useUIStore } from '@/lib/store/uiStore';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  BarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: Users,
  },
  {
    name: 'Campaigns',
    href: '/campaigns',
    icon: BarChart,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-white transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div
          className={cn(
            'flex items-center gap-2 font-semibold',
            sidebarCollapsed && 'hidden'
          )}
        >
          <span className="text-xl font-bold text-blue-600">LinkBird</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className={cn(sidebarCollapsed && 'hidden')}>{item.name}</span>
              {isActive && sidebarCollapsed && (
                <div className="absolute left-0 h-8 w-1 rounded-r-md bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div
          className={cn(
            'mb-2 flex items-center gap-3',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gray-200">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="h-full w-full rounded-full object-cover"
                width={32}
                height={32}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {session?.user?.name?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className={cn('flex-1 truncate', sidebarCollapsed && 'hidden')}>
            <div className="font-medium">{session?.user?.name || 'User'}</div>
            <div className="text-xs text-gray-500 truncate">
              {session?.user?.email || ''}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size={sidebarCollapsed ? 'icon' : 'default'}
          className={cn('w-full', sidebarCollapsed && 'h-8 w-8')}  
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          <span className={cn(sidebarCollapsed && 'hidden')}>Sign out</span>
        </Button>
      </div>
    </aside>
  );
}