import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import {
  Plus,
  MessageSquare,
  BarChart2,
  FileText,
  Trash2,
  Search,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    threads, 
    activeThread, 
    fetchThreads, 
    createThread, 
    deleteThread 
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user) {
      fetchThreads();
    }
  }, [user, fetchThreads]);

  // Global Shift + Q keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.shiftKey && (e.key === 'Q' || e.key === 'q')) {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewChat = async () => {
    try {
      const newThread = await createThread('New Academic Query', 'all');
      router.push(`/chat/${newThread._id || newThread.id}`);
      if (onClose) onClose();
    } catch (e) {
      console.error('Failed to create thread:', e);
    }
  };

  const handleSelectThread = (threadId) => {
    router.push(`/chat/${threadId}`);
    if (onClose) onClose();
  };

  const handleDeleteThread = (e, threadId) => {
    e.stopPropagation();
    deleteThread(threadId);
    if (activeThread && (activeThread._id === threadId || activeThread.id === threadId)) {
      router.push('/chat');
    }
  };

  // Filter threads by search query
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    return threads.filter(t => 
      (t.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [threads, searchQuery]);

  // Group threads into Today, Previous 7 Days, Last 30 Days
  const { todayList, weekList, monthList } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const today = [];
    const week = [];
    const month = [];

    filteredThreads.forEach(t => {
      const tDate = new Date(t.createdAt || Date.now());
      if (tDate.toDateString() === todayStr) {
        today.push(t);
      } else if (tDate >= sevenDaysAgo) {
        week.push(t);
      } else {
        month.push(t);
      }
    });

    return { todayList: today, weekList: week, monthList: month };
  }, [filteredThreads]);

  const currentPath = router.pathname;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#090D16]/75 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 md:inset-auto left-0 z-50 md:z-10 w-64 h-full flex flex-col bg-white dark:bg-[#0F172A]/70 backdrop-blur-2xl border-r border-[#E2E8F0] dark:border-[#1F2937] transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between p-3 border-b border-[#E2E8F0] dark:border-[#1F2937] md:hidden">
          <span className="text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB]">
            Navigation Menu
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Top Action: New Academic Query Button (Matching Reference Image with ⇧ + Q) */}
        <div className="p-3 pb-2">
          <button
            onClick={handleNewChat}
            className="w-full relative group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-white dark:text-[#090D16] bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all duration-200 active:scale-[0.98]"
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-white dark:text-[#090D16]" />
              <span>New Academic Query</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/20 text-white dark:text-[#090D16] font-bold">
              ⇧ + Q
            </span>
          </button>
        </div>

        {/* Student Section Header & Search Input */}
        <div className="px-3 pb-2 space-y-1.5 border-b border-[#E2E8F0] dark:border-[#1F2937]/70">
          <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF]">
            Student Section
          </p>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F1F5F9] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] placeholder-[#64748B] dark:placeholder-[#9CA3AF] outline-hidden focus:border-[#059669] dark:focus:border-[#10B981] transition"
            />
          </div>
        </div>

        {/* Scrollable Thread Lists */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin">
          
          {/* Today Section */}
          <div className="space-y-1">
            <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF]">
              Today
            </p>

            {todayList.length === 0 && weekList.length === 0 && monthList.length === 0 ? (
              <div className="text-center py-4 px-1">
                <p className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">No queries yet.</p>
              </div>
            ) : (
              todayList.map((t) => {
                const threadId = t._id || t.id;
                const isActive = activeThread && (activeThread._id === threadId || activeThread.id === threadId);

                return (
                  <div
                    key={threadId}
                    onClick={() => handleSelectThread(threadId)}
                    className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition ${
                      isActive
                        ? 'bg-[#ECFDF5] dark:bg-[#111827] text-[#059669] dark:text-[#10B981] font-bold border border-[#A7F3D0] dark:border-[#10B981]/40 shadow-xs'
                        : 'text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#F8FAFC] dark:hover:bg-[#111827] hover:text-[#0F172A] dark:hover:text-[#F9FAFB]'
                    }`}
                  >
                    <span className="truncate pr-2">{t.title || 'Academic Query'}</span>

                    {/* Direct Trash Delete Icon Button */}
                    <button
                      onClick={(e) => handleDeleteThread(e, threadId)}
                      className="p-1 text-[#64748B] dark:text-[#9CA3AF] hover:text-rose-500 opacity-60 group-hover:opacity-100 transition rounded shrink-0"
                      title="Delete thread"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Previous 7 Days Section */}
          {weekList.length > 0 && (
            <div className="space-y-1 pt-1">
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF]">
                Previous 7 Days
              </p>
              {weekList.map((t) => {
                const threadId = t._id || t.id;
                const isActive = activeThread && (activeThread._id === threadId || activeThread.id === threadId);

                return (
                  <div
                    key={threadId}
                    onClick={() => handleSelectThread(threadId)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition ${
                      isActive
                        ? 'bg-[#ECFDF5] dark:bg-[#111827] text-[#059669] dark:text-[#10B981] font-bold border border-[#A7F3D0] dark:border-[#10B981]/40'
                        : 'text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#F8FAFC] dark:hover:bg-[#111827] hover:text-[#0F172A] dark:hover:text-[#F9FAFB]'
                    }`}
                  >
                    <span className="truncate pr-2">{t.title || 'Academic Query'}</span>
                    
                    {/* Trash Delete Icon */}
                    <button
                      onClick={(e) => handleDeleteThread(e, threadId)}
                      className="p-1 text-[#64748B] dark:text-[#9CA3AF] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition rounded shrink-0"
                      title="Delete thread"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Last 30 Days Section */}
          {monthList.length > 0 && (
            <div className="space-y-1 pt-1">
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF]">
                Last 30 Days
              </p>
              {monthList.map((t) => {
                const threadId = t._id || t.id;
                const isActive = activeThread && (activeThread._id === threadId || activeThread.id === threadId);

                return (
                  <div
                    key={threadId}
                    onClick={() => handleSelectThread(threadId)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition ${
                      isActive
                        ? 'bg-[#ECFDF5] dark:bg-[#111827] text-[#059669] dark:text-[#10B981] font-bold border border-[#A7F3D0] dark:border-[#10B981]/40'
                        : 'text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#F8FAFC] dark:hover:bg-[#111827] hover:text-[#0F172A] dark:hover:text-[#F9FAFB]'
                    }`}
                  >
                    <span className="truncate pr-2">{t.title || 'Academic Query'}</span>
                    
                    {/* Trash Delete Icon */}
                    <button
                      onClick={(e) => handleDeleteThread(e, threadId)}
                      className="p-1 text-[#64748B] dark:text-[#9CA3AF] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition rounded shrink-0"
                      title="Delete thread"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Admin Section (Role-Gated) */}
        {isAdmin && (
          <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1F2937]/70 space-y-1">
            <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF]">
              Admin Section (Role-Gated)
            </p>

            <Link
              href="/admin/dashboard"
              onClick={onClose}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentPath === '/admin/dashboard'
                  ? 'bg-amber-50 dark:bg-[#111827] text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
                  : 'text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#F8FAFC] dark:hover:bg-[#111827]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Analytics Telemetry</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold">
                0
              </span>
            </Link>

            <Link
              href="/admin/documents"
              onClick={onClose}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentPath === '/admin/documents'
                  ? 'bg-[#ECFDF5] dark:bg-[#111827] text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#10B981]/40'
                  : 'text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#F8FAFC] dark:hover:bg-[#111827]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
                <span>Document Knowledge Base</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#10B981]/10 text-[#059669] dark:text-[#10B981] font-bold">
                12
              </span>
            </Link>
          </div>
        )}

        {/* Bottom Status Pill */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1F2937]/70">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/20 border border-[#A7F3D0] dark:border-[#10B981]/30 text-xs text-[#059669] dark:text-[#10B981] font-semibold">
            <span>Vector Index: Ready</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          </div>
        </div>

      </aside>
    </>
  );
}
