import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { executeThemeTransition } from '../../utils/themeTransition';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown
} from 'lucide-react';

import { glideScrollTo } from '../../utils/glideScroll';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('campusrag_theme');
      if (storedTheme === 'light') {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      } else {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const handleToggleTheme = (event) => {
    const targetDark = !isDark;
    executeThemeTransition(targetDark, event, (updatedDark) => {
      setIsDark(updatedDark);
    });
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isLandingPage = router.pathname === '/';

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    if (router.pathname !== '/') {
      router.push(`/#${targetId}`);
    } else {
      glideScrollTo(targetId, 75);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 shrink-0 w-full border-b border-[#E2E8F0] dark:border-[#1F2937] bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-xl transition-colors">
      <div className="relative w-full h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Geometric Vector Logo + CampusRAG Brand -> ALWAYS links to landing page '/' */}
        <div className="flex items-center space-x-3 shrink-0">
          {!isLandingPage && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-xl text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#F1F5F9] dark:hover:bg-[#111827] md:hidden transition active:scale-95"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link href="/" className="flex items-center space-x-2.5 group">
            {/* CampusRAG Logo Image */}
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.35)] flex items-center justify-center shrink-0 border border-[#10B981]/30">
              <img src="/logo.png" alt="CampusRAG Logo" className="w-full h-full object-contain" />
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base leading-tight bg-gradient-to-r from-[#0F172A] dark:from-[#F9FAFB] to-[#059669] dark:to-[#10B981] bg-clip-text text-transparent">
                CampusRAG
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Absolute Viewport Centered Navigation / Knowledge Base Status */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center pointer-events-auto">
          {isLandingPage ? (
            <nav className="flex items-center space-x-8 font-semibold text-xs text-[#64748B] dark:text-[#9CA3AF]">
              <a 
                href="#engine" 
                onClick={(e) => handleSmoothScroll(e, 'engine')}
                className="hover:text-[#059669] dark:hover:text-[#10B981] transition cursor-pointer"
              >
                Engine
              </a>
              <a 
                href="#architecture" 
                onClick={(e) => handleSmoothScroll(e, 'architecture')}
                className="hover:text-[#059669] dark:hover:text-[#10B981] transition cursor-pointer"
              >
                Architecture
              </a>
              <a 
                href="#showcase" 
                onClick={(e) => handleSmoothScroll(e, 'showcase')}
                className="hover:text-[#059669] dark:hover:text-[#10B981] transition cursor-pointer"
              >
                Showcase
              </a>
            </nav>
          ) : (
            <div className="inline-flex items-center space-x-2 bg-[#ECFDF5] dark:bg-[#064E3B]/25 px-3.5 py-1 rounded-full text-xs font-semibold text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#10B981]/40 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Active Knowledge Base: Connected</span>
            </div>
          )}
        </div>

        {/* Right Section: Shortcut Pill + 60fps Theme Toggle + User Profile */}
        <div className="flex items-center space-x-2.5 shrink-0">
          
          {/* Global Academic Query Shortcut Badge */}
          <div className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#F1F5F9] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] text-[11px] font-mono text-[#64748B] dark:text-[#9CA3AF] select-none">
            <span>⇧ + Q</span>
          </div>

          {/* Smooth 60fps Interactive Theme Button */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-xl text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#F1F5F9] dark:hover:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] transition-all duration-300 shadow-2xs group active:scale-90 overflow-hidden"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme Mode"
          >
            <div className="relative w-4 h-4">
              <Sun
                className={`w-4 h-4 text-amber-400 absolute inset-0 transition-all duration-500 transform ${
                  isDark
                    ? 'rotate-0 scale-100 opacity-100'
                    : 'rotate-90 scale-0 opacity-0'
                }`}
              />
              <Moon
                className={`w-4 h-4 text-[#6366F1] absolute inset-0 transition-all duration-500 transform ${
                  isDark
                    ? '-rotate-90 scale-0 opacity-0'
                    : 'rotate-0 scale-100 opacity-100'
                }`}
              />
            </div>
          </button>

          {/* User Profile Capsule with matching-width dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#111827] transition border border-transparent hover:border-[#E2E8F0] dark:border-[#1F2937]/50"
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#059669] to-[#4F46E5] p-0.5 shadow-xs shrink-0">
                  <div className="w-full h-full rounded-full bg-[#090D16] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {user.name ? user.name.charAt(0) : 'A'}
                  </div>
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] leading-tight">
                      {user.name || 'Alex Chen'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F1F5F9] dark:bg-[#111827] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937] font-bold uppercase">
                      {user.role || 'STUDENT'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#9CA3AF] leading-none mt-0.5">
                    {user.department ? user.department.charAt(0).toUpperCase() + user.department.slice(1) : 'General'}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-[#64748B] dark:text-[#9CA3AF]" />
              </button>

              {/* Dropdown Menu - perfectly sized to the profile capsule button */}
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-full min-w-[200px] bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-[#1F2937] py-2 z-50 animate-fade-in"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  {/* Signed in as & Role */}
                  <div className="px-3.5 py-2">
                    <p className="text-[10px] font-medium text-[#64748B] dark:text-[#9CA3AF]">Signed in as</p>
                    <p className="text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] truncate mt-0.5">{user.email}</p>
                    <div className="mt-1.5">
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#EEF2FF] dark:bg-[#1E1B4B]/70 text-[#4F46E5] dark:text-[#A5B4FC] border border-[#C7D2FE] dark:border-[#3730A3]">
                        Role: {user.role || 'Student'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#E2E8F0] dark:border-[#1F2937] my-1" />

                  {/* Sign Out Button */}
                  <div className="px-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white dark:text-[#090D16] bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] shadow-sm shadow-[#10B981]/25 transition"
              >
                Register
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
