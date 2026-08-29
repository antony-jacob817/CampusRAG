import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Sparkles,
  Database,
  Cpu,
  Activity,
  Layers,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import AppShell from '../components/AppShell/AppShell';

export default function LoginPage() {
  const router = useRouter();
  const { login, resendVerification, isAuthenticated, error, clearError, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const [unverifiedState, setUnverifiedState] = useState(null); // { email: string, msg?: string, link?: string }
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = router.query.redirect || '/chat';
      router.push(redirect);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setLocalError('');
    setUnverifiedState(null);
    clearError();

    const result = await login(email.trim(), password);
    if (result.success) {
      const redirect = router.query.redirect || (result.user.role === 'admin' ? '/admin/dashboard' : '/chat');
      router.push(redirect);
    } else if (result.unverified) {
      setUnverifiedState({
        email: result.email || email.trim(),
        msg: result.error,
      });
    }
  };

  const handleResendFromLogin = async () => {
    if (!unverifiedState?.email) return;
    setIsResending(true);
    const res = await resendVerification(unverifiedState.email);
    setIsResending(false);

    if (res.success) {
      setUnverifiedState((prev) => ({
        ...prev,
        link: res.verificationLink,
        sent: true,
      }));
    }
  };

  const handleQuickLogin = async (role) => {
    setLocalError('');
    setUnverifiedState(null);
    clearError();
    if (role === 'student') {
      setEmail('student@campus.edu');
      setPassword('Student@123');
      const res = await login('student@campus.edu', 'Student@123');
      if (res.success) router.push('/chat');
    } else {
      setEmail('admin@campus.edu');
      setPassword('Admin@123');
      const res = await login('admin@campus.edu', 'Admin@123');
      if (res.success) router.push('/admin/dashboard');
    }
  };

  return (
    <AppShell showSidebar={false}>
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F9FAFB] bg-tech-grid transition-colors px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        
        {/* Ambient Neon Glows */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#10B981]/20 dark:bg-[#10B981]/25 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute top-2/3 right-10 w-[450px] h-[450px] bg-[#6366F1]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Main 2-Column Split Content */}
        <div className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-4">
          
          {/* Left Column: Vector Network & Store Visualizer (Matching Reference) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Vector Visualization Card */}
            <div className="relative bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-3xl border border-[#E2E8F0] dark:border-[#1F2937] p-6 shadow-2xl overflow-hidden group">
              
              {/* Subtle top glow line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-60" />

              {/* Isometric Vector Node Network Graphic */}
              <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-[#F1F5F9] dark:bg-[#090D16]/90 border border-[#E2E8F0] dark:border-[#1F2937] flex items-center justify-center overflow-hidden">
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-tech-grid opacity-50" />

                {/* SVG Isometric Node Graph */}
                <svg className="w-full h-full p-4" viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="140" y1="120" x2="250" y2="150" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse opacity-60" />
                  <line x1="360" y1="110" x2="250" y2="150" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse opacity-60" />
                  <line x1="150" y1="210" x2="250" y2="150" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 4" className="opacity-50" />
                  <line x1="350" y1="200" x2="250" y2="150" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" className="opacity-60" />
                  
                  <g className="hover:scale-105 transition-transform">
                    <rect x="110" y="90" width="60" height="60" rx="14" fill="#111827" stroke="#1F2937" strokeWidth="2" />
                    <rect x="115" y="95" width="50" height="50" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="140" cy="120" r="10" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
                    <circle cx="140" cy="120" r="4" fill="#10B981" />
                  </g>

                  <g className="hover:scale-105 transition-transform">
                    <rect x="210" y="110" width="80" height="80" rx="20" fill="#111827" stroke="#10B981" strokeWidth="2" className="shadow-lg" />
                    <rect x="218" y="118" width="64" height="64" rx="14" fill="#090D16" stroke="#10B981" strokeWidth="1.5" />
                    <circle cx="250" cy="150" r="16" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
                    <circle cx="250" cy="150" r="6" fill="#10B981" />
                    <circle cx="250" cy="150" r="24" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" className="animate-spin origin-center" />
                  </g>

                  <g className="hover:scale-105 transition-transform">
                    <rect x="330" y="80" width="60" height="60" rx="14" fill="#111827" stroke="#1F2937" strokeWidth="2" />
                    <rect x="335" y="85" width="50" height="50" rx="10" fill="#0F172A" stroke="#6366F1" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="360" cy="110" r="10" fill="#6366F1" fillOpacity="0.2" stroke="#6366F1" strokeWidth="2" />
                    <circle cx="360" cy="110" r="4" fill="#6366F1" />
                  </g>

                  <g className="hover:scale-105 transition-transform">
                    <rect x="120" y="180" width="60" height="60" rx="14" fill="#111827" stroke="#1F2937" strokeWidth="2" />
                    <rect x="125" y="185" width="50" height="50" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
                    <circle cx="150" cy="210" r="8" fill="#10B981" />
                  </g>

                  <g className="hover:scale-105 transition-transform">
                    <rect x="320" y="170" width="60" height="60" rx="14" fill="#111827" stroke="#1F2937" strokeWidth="2" />
                    <rect x="325" y="175" width="50" height="50" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
                    <circle cx="350" cy="200" r="8" fill="#10B981" />
                  </g>
                </svg>
              </div>

              {/* Status Header below Visual */}
              <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2 font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                  <span>Real-Time Campus Vector Store:</span>
                  <span className="text-[#059669] dark:text-[#10B981]">Connected</span>
                </div>
                <div className="flex items-center space-x-2 font-semibold text-[#64748B] dark:text-[#9CA3AF]">
                  <span>Nodes: 1,248</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                </div>
              </div>
            </div>

            {/* Decorative Dot Matrix Telemetry Grid */}
            <div className="hidden sm:flex items-center justify-between px-2 text-[10px] font-mono text-[#64748B] dark:text-[#9CA3AF]/60 select-none">
              <div className="flex space-x-1.5">
                <span>••••••••</span>
                <span>••••••••</span>
                <span>••••••••</span>
              </div>
              <div className="tracking-widest">
                01010110 01000101 01000011 01010100
              </div>
            </div>
          </div>

          {/* Right Column: High-End Auth Card (Matching Reference) */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl rounded-3xl border border-[#E2E8F0] dark:border-[#1F2937] p-7 sm:p-8 shadow-2xl space-y-6">
              
              {/* Brand Header Inside Card */}
              <div className="space-y-1.5 text-center">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#059669] dark:text-[#10B981] mb-1">
                  <div className="w-5 h-5 rounded-lg overflow-hidden border border-[#10B981]/40 flex items-center justify-center">
                    <img src="/logo.png" alt="CampusRAG Logo" className="w-full h-full object-contain" />
                  </div>
                  <span>CampusRAG</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F9FAFB] tracking-tight">
                  Welcome back
                </h1>
              </div>

              {/* Error Banner */}
              {(error || localError) && !unverifiedState && (
                <div className="flex items-center space-x-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Error: {error || localError}</span>
                </div>
              )}

              {/* Unverified Email Warning & 1-Click Resend */}
              {unverifiedState && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-2.5 animate-fade-in">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Email Verification Required</span>
                      <span className="text-[11px] text-amber-700 dark:text-amber-400">
                        {unverifiedState.msg || 'Please verify your email before logging in.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={handleResendFromLogin}
                      disabled={isResending}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition shadow-xs disabled:opacity-50"
                    >
                      {isResending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      <span>Resend Link</span>
                    </button>

                    <Link
                      href="/verify-email"
                      className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Go to Verification Page
                    </Link>
                  </div>

                  {unverifiedState.link && (
                    <div className="pt-1">
                      <a
                        href={unverifiedState.link}
                        className="inline-flex items-center text-[11px] font-bold text-[#059669] dark:text-[#10B981] hover:underline"
                      >
                        <span>Click to Verify Email Directly</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] outline-hidden focus:border-[#059669] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition placeholder-[#64748B] dark:placeholder-[#9CA3AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] outline-hidden focus:border-[#059669] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition placeholder-[#64748B] dark:placeholder-[#9CA3AF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white dark:text-[#090D16] bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] shadow-md shadow-[#10B981]/25 transition active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </form>

              {/* Quick 1-Click Demo Buttons (Matching Reference) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student')}
                  disabled={isLoading}
                  className="flex items-center justify-between p-3 rounded-2xl text-xs font-bold bg-[#ECFDF5] dark:bg-[#0F172A] hover:bg-[#D1FAE5] dark:hover:bg-[#111827] text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#10B981]/40 transition active:scale-95 disabled:opacity-50 group"
                >
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-[#059669] dark:text-[#10B981]" />
                    <div className="text-left">
                      <div className="text-[10px] text-[#64748B] dark:text-[#9CA3AF] font-normal leading-none">Quick Demo:</div>
                      <div className="font-bold text-xs mt-0.5">Student</div>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#10B981]/15 text-[#059669] dark:text-[#10B981] font-bold">
                    Student
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="flex items-center justify-between p-3 rounded-2xl text-xs font-bold bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#111827] text-[#0F172A] dark:text-[#F9FAFB] border border-[#E2E8F0] dark:border-[#1F2937] transition active:scale-95 disabled:opacity-50 group"
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <div className="text-left">
                      <div className="text-[10px] text-[#64748B] dark:text-[#9CA3AF] font-normal leading-none">Quick Demo:</div>
                      <div className="font-bold text-xs mt-0.5">Admin</div>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-bold">
                    Admin
                  </span>
                </button>
              </div>

              {/* Registration Link */}
              <div className="pt-2 text-center text-xs text-[#64748B] dark:text-[#9CA3AF]">
                Don't have an account?{' '}
                <Link href="/register" className="font-bold text-[#059669] dark:text-[#10B981] hover:underline">
                  Create an account
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* Technical Status Footer */}
        <div className="max-w-6xl w-full mx-auto pt-6 border-t border-[#E2E8F0] dark:border-[#1F2937]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] dark:text-[#9CA3AF]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 text-[#0F172A] dark:text-[#F9FAFB] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>System Status: All Systems Operational</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Data Integrity: Verified</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:text-[#059669] dark:hover:text-[#10B981] transition">Platform Links</Link>
            <Link href="/#showcase" className="hover:text-[#059669] dark:hover:text-[#10B981] transition">Showcase</Link>
            <span>© 2026 CampusRAG</span>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
