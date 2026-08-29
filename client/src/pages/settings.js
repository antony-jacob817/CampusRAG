import React, { useState, useEffect } from 'react';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { executeThemeTransition } from '../utils/themeTransition';
import api from '../services/api';
import { 
  User, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Activity, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Key,
  Command,
  Sparkles,
  Layers
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [isDark, setIsDark] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('campusrag_theme');
      setIsDark(storedTheme !== 'light');
    }

    const checkHealth = async () => {
      setIsCheckingHealth(true);
      try {
        const res = await api.get('/health');
        setHealthStatus(res.data);
      } catch (err) {
        console.warn('Health check failed:', err);
      } finally {
        setIsCheckingHealth(false);
      }
    };

    checkHealth();
  }, []);

  const handleThemeChange = (targetDark, event) => {
    executeThemeTransition(targetDark, event, (updatedDark) => {
      setIsDark(updatedDark);
    });
  };

  return (
    <ProtectedRoute>
      <AppShell showSidebar={true}>
        <div className="relative p-4 sm:p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6">
          
          {/* Top Ambient Studio Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#10B981]/15 via-[#6366F1]/8 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-[#F9FAFB] tracking-tight">
                Platform & Account Settings
              </h1>
              <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                Manage your user profile, interface appearance mode, and inspect system telemetry health.
              </p>
            </div>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#065F46]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>0.65 Cosine Guardrail Active</span>
            </span>
          </div>

          {/* User Profile Card */}
          <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xl space-y-5">
            <div className="flex items-center space-x-3 pb-3.5 border-b border-[#E2E8F0] dark:border-[#1F2937]">
              <div className="p-2.5 rounded-2xl bg-[#ECFDF5] dark:bg-[#0F172A] text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#10B981]/30">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                  User Profile & Authentication Authority
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                  Credentials and access permissions for academic queries
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] dark:text-[#9CA3AF] uppercase tracking-wider block">
                  Full Name
                </span>
                <span className="font-bold text-[#0F172A] dark:text-[#F9FAFB] text-xs truncate block">
                  {user?.name || 'Academic User'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] dark:text-[#9CA3AF] uppercase tracking-wider block">
                  Campus Email
                </span>
                <span className="font-mono text-[#0F172A] dark:text-[#F9FAFB] text-xs truncate block">
                  {user?.email || 'user@campus.edu'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] dark:text-[#9CA3AF] uppercase tracking-wider block">
                  Access Authority
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  user?.role === 'admin' 
                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' 
                    : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                }`}>
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {user?.role || 'Student'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] dark:text-[#9CA3AF] uppercase tracking-wider block">
                  Target Department
                </span>
                <span className="text-[#0F172A] dark:text-[#F9FAFB] font-semibold capitalize truncate block">
                  {user?.department || 'General Academic'}
                </span>
              </div>
            </div>
          </div>

          {/* Theme Settings & Keyboard Shortcuts in 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Theme Settings Card */}
            <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xl space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0] dark:border-[#1F2937]">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Interface Appearance Theme
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
                    60fps Hardware-Accelerated View Transitions
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={(e) => handleThemeChange(false, e)}
                  className={`flex items-center justify-center space-x-2 p-3.5 rounded-2xl text-xs font-bold border transition duration-200 active:scale-95 ${
                    !isDark 
                      ? 'bg-[#ECFDF5] border-[#059669] text-[#059669] shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-[#F8FAFC] dark:bg-[#090D16] border-[#E2E8F0] dark:border-[#1F2937] text-[#64748B] dark:text-[#9CA3AF]'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleThemeChange(true, e)}
                  className={`flex items-center justify-center space-x-2 p-3.5 rounded-2xl text-xs font-bold border transition duration-200 active:scale-95 ${
                    isDark 
                      ? 'bg-[#090D16] border-[#10B981] text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
                      : 'bg-[#F8FAFC] dark:bg-[#090D16] border-[#E2E8F0] dark:border-[#1F2937] text-[#64748B] dark:text-[#9CA3AF]'
                  }`}
                >
                  <Moon className="w-4 h-4 text-[#6366F1]" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Cheatsheet Card */}
            <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xl space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0] dark:border-[#1F2937]">
                <div className="p-2 rounded-xl bg-[#EEF2FF] dark:bg-[#1E1B4B]/50 text-[#4F46E5] dark:text-[#A5B4FC]">
                  <Command className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Keyboard Navigation Shortcuts
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
                    Rapid workspace actions
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937]">
                  <span className="text-[#64748B] dark:text-[#9CA3AF]">New Academic Query</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] font-mono text-[11px] font-bold text-[#059669] dark:text-[#10B981]">
                    ⇧ + Q
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937]">
                  <span className="text-[#64748B] dark:text-[#9CA3AF]">Send Question / Query</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] font-mono text-[11px] font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Enter
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937]">
                  <span className="text-[#64748B] dark:text-[#9CA3AF]">Multiline Code / Break</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] font-mono text-[11px] font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Shift + Enter
                  </kbd>
                </div>
              </div>
            </div>

          </div>

          {/* System Health & Connection Status */}
          <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xl space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0] dark:border-[#1F2937]">
              <div className="p-2 rounded-xl bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981]">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                System Health & Integration Telemetry
              </h3>
            </div>

            {healthStatus ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] space-y-2">
                  <div className="flex items-center justify-between">
                    <Database className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                    <span className="flex items-center text-[#059669] dark:text-[#10B981] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Operational
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] dark:text-[#F9FAFB] block">Database Connection</span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] font-mono">Mode: {healthStatus.database?.mode}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] space-y-2">
                  <div className="flex items-center justify-between">
                    <Key className="w-4 h-4 text-[#059669] dark:text-[#10B981]" />
                    <span className="flex items-center text-[#059669] dark:text-[#10B981] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Indexed
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] dark:text-[#F9FAFB] block">Vector Memory Store</span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] font-mono">Provider: {healthStatus.vectorStore?.provider}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] space-y-2">
                  <div className="flex items-center justify-between">
                    <Cpu className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                    <span className="flex items-center text-[#059669] dark:text-[#10B981] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Ready
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] dark:text-[#F9FAFB] block">RAG AI Generation Engine</span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] font-mono truncate block">{healthStatus.aiProvider}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">Loading system status...</p>
            )}
          </div>

        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
