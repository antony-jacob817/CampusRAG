import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { 
  Sparkles,
  ShieldCheck, 
  Database, 
  User 
} from 'lucide-react';

export default function ActivityRail() {
  const router = useRouter();
  const { user } = useAuthStore();
  const currentPath = router.pathname;
  const isAdmin = user?.role === 'admin';

  // Navigation items based on user role
  const chatNavItem = { 
    id: 'chat', 
    label: 'Academic Assistant', 
    href: '/chat', 
    icon: Sparkles, 
    active: currentPath.startsWith('/chat'),
    iconColor: 'text-[#10B981]',
    activeBorder: 'border-[#10B981]/60 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    indicatorColor: 'bg-[#10B981]'
  };

  const adminAnalyticsNavItem = { 
    id: 'analytics', 
    label: 'Admin Analytics', 
    href: '/admin/dashboard', 
    icon: ShieldCheck, 
    active: currentPath === '/admin/dashboard',
    iconColor: 'text-[#F59E0B]',
    activeBorder: 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    indicatorColor: 'bg-[#F59E0B]'
  };

  const adminDocumentsNavItem = { 
    id: 'documents', 
    label: 'Document Knowledge Base', 
    href: '/admin/documents', 
    icon: Database, 
    active: currentPath === '/admin/documents',
    iconColor: 'text-[#10B981]',
    activeBorder: 'border-[#10B981]/60 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    indicatorColor: 'bg-[#10B981]'
  };

  const settingsNavItem = { 
    id: 'settings', 
    label: 'Account Settings', 
    href: '/settings', 
    icon: User, 
    active: currentPath === '/settings',
    iconColor: 'text-[#94A3B8]',
    activeBorder: 'border-slate-400/60 shadow-[0_0_15px_rgba(148,163,184,0.2)]',
    indicatorColor: 'bg-[#94A3B8]'
  };

  // For Admin: Analytics -> Documents -> Chat (below documents) -> Settings
  // For Student: Chat -> Settings
  const visibleNavItems = isAdmin
    ? [adminAnalyticsNavItem, adminDocumentsNavItem, chatNavItem, settingsNavItem]
    : [chatNavItem, settingsNavItem];

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-14 h-full bg-white dark:bg-[#090D16] border-r border-[#E2E8F0] dark:border-[#1F2937] py-4 z-20 shrink-0 select-none">
      
      {/* Top Navigation Icons strictly filtered by role */}
      <div className="flex flex-col items-center space-y-3 w-full px-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 group ${
                item.active
                  ? `bg-[#ECFDF5] dark:bg-[#111827] ${item.iconColor} border ${item.activeBorder}`
                  : `${item.iconColor} opacity-75 hover:opacity-100 hover:bg-[#F1F5F9] dark:hover:bg-[#111827]`
              }`}
            >
              <Icon className="w-4 h-4" />

              {/* Active Left Indicator Notch */}
              {item.active && (
                <span className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r ${item.indicatorColor}`} />
              )}

              {/* Hover Tooltip */}
              <div className="absolute left-14 px-2.5 py-1 rounded-lg bg-[#0F172A] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition shadow-lg z-50">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom User Avatar - Static display with NO navigation */}
      {user && (
        <div className="px-2 cursor-default select-none" title={`Signed in as ${user.name || 'User'} (${user.role || 'student'})`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#059669] to-[#4F46E5] p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-[#090D16] flex items-center justify-center text-[11px] font-bold text-white uppercase">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}
