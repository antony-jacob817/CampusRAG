import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ActivityRail from './ActivityRail';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare } from 'lucide-react';

export default function AppShell({ children, showSidebar = true }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const currentPath = router.asPath;
  const isLandingPage = router.pathname === '/';
  const isChatPage = router.pathname.startsWith('/chat');

  return (
    <div className={`flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F9FAFB] bg-tech-grid transition-colors ${
      showSidebar ? 'h-screen overflow-hidden' : 'min-h-screen'
    }`}>
      {/* Pinned Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className={`flex-1 flex min-h-0 ${showSidebar ? 'h-[calc(100vh-3.5rem)] overflow-hidden' : ''}`}>
        
        {/* Tier 1: Far-Left Primary Activity Icon Rail */}
        {showSidebar && !isLandingPage && <ActivityRail />}

        {/* Tier 2: Academic Query Sidebar (ONLY rendered when in Academic Assistant / Chat) */}
        {showSidebar && isChatPage && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Work Area Canvas */}
        <main className={`flex-1 flex flex-col min-w-0 ${
          showSidebar ? 'overflow-y-auto h-full' : 'min-h-0'
        } bg-transparent`}>
          
          {/* Top Breadcrumb Tab Strip (Rendered for Chat Canvas) */}
          {showSidebar && isChatPage && (
            <div className="h-9 px-4 sm:px-6 border-b border-[#E2E8F0] dark:border-[#1F2937]/70 bg-white/40 dark:bg-[#090D16]/40 backdrop-blur-md flex items-center justify-between text-xs text-[#64748B] dark:text-[#9CA3AF] shrink-0">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
                <span className="font-mono text-[11px] text-[#0F172A] dark:text-[#F9FAFB]">
                  {currentPath}
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>Grounded Stream Active</span>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
