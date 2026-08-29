import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Sparkles,
  Database,
  Layers,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import AppShell from '../components/AppShell/AppShell';

const DEPARTMENTS = [
  { id: 'academics', label: 'Computer Science & Engineering' },
  { id: 'admissions', label: 'First Year Admissions' },
  { id: 'examinations', label: 'Examinations Branch' },
  { id: 'hostel', label: 'Residential Hostel Board' },
  { id: 'placements', label: 'Career & Placement Cell' },
  { id: 'general', label: 'General Sciences & Humanities' },
];

const KNOWN_TEMP_DOMAINS = [
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'sharklasers.com', 'yopmail.com', 'throwawaymail.com', 'trashmail.com',
  'dispostable.com', 'fakeinbox.com', 'temp-mail.org', 'getnada.com',
  'mohmal.com', 'crazymailing.com', 'inboxkitten.com', 'mytemp.email',
  'tempail.com', 'burnermail.io', 'emailondeck.com'
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, error, clearError, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('academics');
  const [localError, setLocalError] = useState('');
  const [registeredVerification, setRegisteredVerification] = useState(null); // { user, verificationLink, message }

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, router]);

  const isTempEmail = (emailStr) => {
    if (!emailStr.includes('@')) return false;
    const domain = emailStr.split('@')[1]?.toLowerCase();
    return KNOWN_TEMP_DOMAINS.some((d) => domain?.includes(d));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setLocalError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (isTempEmail(email)) {
      setLocalError('Temporary/disposable email addresses are not permitted. Please use your official campus or personal email address.');
      return;
    }

    setLocalError('');
    clearError();
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      role: 'student',
      department,
    });

    if (result.success) {
      setRegisteredVerification({
        user: result.user,
        verificationLink: result.verificationLink,
        message: result.message,
      });
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
          
          {/* Left Column: Knowledge Base Multi-Department Visualizer */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            <div className="relative bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-3xl border border-[#E2E8F0] dark:border-[#1F2937] p-6 shadow-2xl overflow-hidden group">
              
              {/* Subtle top glow line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-60" />

              {/* Isometric Vector Node Network Graphic */}
              <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-[#F1F5F9] dark:bg-[#090D16]/90 border border-[#E2E8F0] dark:border-[#1F2937] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-tech-grid opacity-50" />

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
                  <span>Campus Academic Knowledge Base:</span>
                  <span className="text-[#059669] dark:text-[#10B981]">Multi-Department</span>
                </div>
                <div className="flex items-center space-x-2 font-semibold text-[#64748B] dark:text-[#9CA3AF]">
                  <span>Active Namespaces: 5</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-between px-2 text-[10px] font-mono text-[#64748B] dark:text-[#9CA3AF]/60 select-none">
              <div className="flex space-x-1.5">
                <span>••••••••</span>
                <span>••••••••</span>
                <span>••••••••</span>
              </div>
              <div className="tracking-widest">
                01000001 01000011 01000001 01000100
              </div>
            </div>
          </div>

          {/* Right Column: Register Card or Verification Modal */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl rounded-3xl border border-[#E2E8F0] dark:border-[#1F2937] p-7 sm:p-8 shadow-2xl space-y-5">
              
              {registeredVerification ? (
                /* Verification Step Required */
                <div className="text-center space-y-5 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/40 border border-[#A7F3D0] dark:border-[#065F46] flex items-center justify-center mx-auto text-[#059669] dark:text-[#10B981] shadow-lg shadow-[#10B981]/20">
                    <Mail className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-[#F9FAFB] tracking-tight">
                      Verify Your Email Address
                    </h2>
                    <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                      An official verification link has been generated for <strong>{email}</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] text-left space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-[#059669] dark:text-[#10B981] font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Security Validation Required</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
                      To prevent unauthorized access and disposable temporary accounts, you must verify this email address before logging in.
                    </p>
                  </div>

                  {registeredVerification.verificationLink && (
                    <div className="space-y-2 pt-1">
                      <a
                        href={registeredVerification.verificationLink}
                        className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] text-white dark:text-[#090D16] font-bold text-xs shadow-md shadow-[#10B981]/25 transition active:scale-95"
                      >
                        <span>Click to Verify Email & Enter</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  <div className="pt-2 text-center text-xs text-[#64748B] dark:text-[#9CA3AF]">
                    <Link href="/login" className="font-semibold hover:text-[#0F172A] dark:hover:text-[#F9FAFB] transition">
                      Proceed to Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                /* Registration Form */
                <>
                  <div className="space-y-1.5 text-center">
                    <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#059669] dark:text-[#10B981] mb-1">
                      <div className="w-5 h-5 rounded-lg overflow-hidden border border-[#10B981]/40 flex items-center justify-center">
                        <img src="/logo.png" alt="CampusRAG Logo" className="w-full h-full object-contain" />
                      </div>
                      <span>CampusRAG</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F9FAFB] tracking-tight">
                      Create an account
                    </h1>
                    <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                      Disposable/temporary emails are automatically blocked.
                    </p>
                  </div>

                  {(error || localError) && (
                    <div className="flex items-start space-x-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error || localError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rachel Adams"
                        className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] outline-hidden focus:border-[#059669] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition placeholder-[#64748B] dark:placeholder-[#9CA3AF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] mb-1">
                        Campus Email Address (No Temp Mails)
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (isTempEmail(e.target.value)) {
                            setLocalError('Temporary/disposable email addresses are blocked.');
                          } else if (localError) {
                            setLocalError('');
                          }
                        }}
                        placeholder="student@campus.edu"
                        className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] outline-hidden focus:border-[#059669] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition placeholder-[#64748B] dark:placeholder-[#9CA3AF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] mb-1">
                        Department / Academic Program
                      </label>
                      <div className="relative">
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] outline-hidden focus:border-[#059669] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition appearance-none cursor-pointer"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#64748B] dark:text-[#9CA3AF] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="•••••••• (min 6 chars)"
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

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white dark:text-[#090D16] bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] shadow-md shadow-[#10B981]/25 transition active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Create Verified Account</span>
                      )}
                    </button>
                  </form>

                  <div className="pt-2 text-center text-xs text-[#64748B] dark:text-[#9CA3AF]">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-[#059669] dark:text-[#10B981] hover:underline">
                      Sign in
                    </Link>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>

        {/* Technical Status Footer */}
        <div className="max-w-6xl w-full mx-auto pt-6 border-t border-[#E2E8F0] dark:border-[#1F2937]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] dark:text-[#9CA3AF]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 text-[#0F172A] dark:text-[#F9FAFB] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>Email Verification Gateway Active</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Disposable Domain Blocker: Enabled</span>
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
