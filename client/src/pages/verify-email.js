import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const { verifyEmail, resendVerification } = useAuthStore();

  const [status, setStatus] = useState('idle'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);

  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null); // { success: boolean, msg: string, link?: string }

  useEffect(() => {
    if (router.isReady && token) {
      handleVerification(token);
    }
  }, [router.isReady, token]);

  const handleVerification = async (verifyToken) => {
    setStatus('loading');
    setErrorMessage('');
    const result = await verifyEmail(verifyToken);
    if (result.success) {
      setStatus('success');
      setVerifiedUser(result.user);
      setSuccessMessage(result.message || 'Your email address has been verified successfully!');
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Verification link is invalid or has expired.');
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setIsResending(true);
    setResendStatus(null);

    const res = await resendVerification(resendEmail.trim());
    setIsResending(false);

    if (res.success) {
      setResendStatus({
        success: true,
        msg: res.message || 'A new verification link has been generated.',
        link: res.verificationLink,
      });
    } else {
      setResendStatus({
        success: false,
        msg: res.error || 'Failed to resend verification link.',
      });
    }
  };

  return (
    <>
      <Head>
        <title>Verify Email | CampusRAG</title>
        <meta name="description" content="Verify your campus account credentials on CampusRAG" />
      </Head>

      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F9FAFB] bg-tech-grid flex flex-col justify-center items-center p-4 sm:p-6 transition-colors relative overflow-hidden">
        {/* Ambient Aurora Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#10B981]/15 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-[#6366F1]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Brand Logo Header */}
        <div className="mb-6 text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center shrink-0 border border-[#10B981]/30">
              <img src="/logo.png" alt="CampusRAG Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-[#0F172A] dark:from-[#F9FAFB] to-[#059669] dark:to-[#10B981] bg-clip-text text-transparent">
              CampusRAG
            </span>
          </Link>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
            Official Institutional Verification Gateway
          </p>
        </div>

        {/* Verification Card */}
        <div className="max-w-md w-full bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] dark:border-[#1F2937] shadow-2xl space-y-6">
          
          {/* Status: Loading */}
          {status === 'loading' && (
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/40 border border-[#A7F3D0] dark:border-[#065F46] flex items-center justify-center mx-auto text-[#059669] dark:text-[#10B981]">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                  Verifying Account Credentials...
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                  Validating your verification token against Campus Security Authority.
                </p>
              </div>
            </div>
          )}

          {/* Status: Success */}
          {status === 'success' && (
            <div className="py-4 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/40 border border-[#A7F3D0] dark:border-[#065F46] flex items-center justify-center mx-auto text-[#059669] dark:text-[#10B981] shadow-lg shadow-[#10B981]/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-[#F9FAFB]">
                  Email Verified Successfully!
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                  {successMessage}
                </p>
              </div>

              {verifiedUser && (
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] text-left space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#9CA3AF]">Verified Account</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#ECFDF5] dark:bg-[#064E3B]/50 text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#065F46]">
                      ACTIVE
                    </span>
                  </div>
                  <p className="font-bold text-[#0F172A] dark:text-[#F9FAFB]">{verifiedUser.name}</p>
                  <p className="font-mono text-[11px] text-[#64748B] dark:text-[#9CA3AF]">{verifiedUser.email}</p>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/chat"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] text-white dark:text-[#090D16] font-bold text-xs shadow-md shadow-[#10B981]/25 transition active:scale-95"
                >
                  <span>Launch Academic Assistant</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Status: Error */}
          {status === 'error' && (
            <div className="py-2 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-500/10">
                <XCircle className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                  Verification Link Invalid or Expired
                </h3>
                <p className="text-xs text-rose-500 dark:text-rose-400">
                  {errorMessage}
                </p>
              </div>

              {/* Resend Section */}
              <div className="border-t border-[#E2E8F0] dark:border-[#1F2937] pt-4 text-left space-y-3">
                <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F9FAFB]">
                  Request a New Verification Link
                </p>

                <form onSubmit={handleResend} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#9CA3AF]" />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Enter your registered email..."
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] text-xs text-[#0F172A] dark:text-[#F9FAFB] focus:border-[#10B981] outline-hidden transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResending || !resendEmail.trim()}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#0F172A] dark:bg-[#1F2937] hover:bg-[#1E293B] dark:hover:bg-[#374151] text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    {isResending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Resend Verification Email</span>
                  </button>
                </form>

                {resendStatus && (
                  <div className={`p-3 rounded-xl text-xs space-y-2 ${
                    resendStatus.success 
                      ? 'bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#065F46] text-[#059669] dark:text-[#10B981]' 
                      : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-500'
                  }`}>
                    <p className="font-semibold">{resendStatus.msg}</p>
                    {resendStatus.link && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-[#64748B] dark:text-[#9CA3AF]">Click link below to complete verification:</p>
                        <a
                          href={resendStatus.link}
                          className="inline-flex items-center text-[11px] font-bold text-[#059669] dark:text-[#10B981] hover:underline"
                        >
                          <span>Complete Email Verification</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] transition"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}

          {/* Status: Idle (No token provided) */}
          {status === 'idle' && !token && (
            <div className="py-2 text-center space-y-5 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/40 border border-[#A7F3D0] dark:border-[#065F46] flex items-center justify-center mx-auto text-[#059669] dark:text-[#10B981]">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                  Verify Your Campus Email
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                  Please enter your email to receive a fresh verification link.
                </p>
              </div>

              <form onSubmit={handleResend} className="space-y-3 text-left">
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#9CA3AF]" />
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] text-xs text-[#0F172A] dark:text-[#F9FAFB] focus:border-[#10B981] outline-hidden transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResending || !resendEmail.trim()}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] text-white dark:text-[#090D16] text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  {isResending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  <span>Send Verification Link</span>
                </button>
              </form>

              {resendStatus && (
                <div className={`p-3 rounded-xl text-xs text-left space-y-2 ${
                  resendStatus.success 
                    ? 'bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#065F46] text-[#059669] dark:text-[#10B981]' 
                    : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-500'
                }`}>
                  <p className="font-semibold">{resendStatus.msg}</p>
                  {resendStatus.link && (
                    <a
                      href={resendStatus.link}
                      className="inline-flex items-center text-[11px] font-bold text-[#059669] dark:text-[#10B981] hover:underline"
                    >
                      <span>Click to Verify Directly</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] transition"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
