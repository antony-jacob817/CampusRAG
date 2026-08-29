import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import StatCards from '../../components/Analytics/StatCards';
import api from '../../services/api';
import { 
  ShieldCheck, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  Loader2,
  FileText,
  UploadCloud,
  Cpu,
  Layers,
  Activity,
  Sparkles
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load telemetry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AppShell showSidebar={true}>
        <div className="relative p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Top Ambient Studio Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#10B981]/15 via-[#6366F1]/8 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

          {/* Header & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-2xl bg-emerald-500/10 text-[#059669] dark:text-[#10B981] border border-[#10B981]/30 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-[#F9FAFB] tracking-tight">
                  Academic Analytics & Telemetry Console
                </h1>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                Live monitoring of student queries, grounding metrics, vector namespaces, and knowledge gaps.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={fetchAnalytics}
                disabled={isRefreshing}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#0F172A] transition shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#059669] dark:text-[#10B981]' : ''}`} />
                <span>Refresh Metrics</span>
              </button>

              <Link
                href="/admin/documents"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white dark:text-[#090D16] bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] shadow-md shadow-[#10B981]/25 transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Manage Handbooks</span>
              </Link>
            </div>
          </div>

          {/* High-Tech Vector Engine Status Bar */}
          {analytics?.vectorStats && (
            <div className="relative overflow-hidden p-5 rounded-3xl bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#1F2937] shadow-xl space-y-4">
              
              {/* Ambient top highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-60" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="p-3 rounded-2xl bg-[#ECFDF5] dark:bg-[#0F172A] text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#10B981]/30">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                        Vector Memory Engine: {analytics.vectorStats.provider === 'in-memory' ? 'In-Memory Cosine Store' : 'Pinecone Serverless'}
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] font-mono mt-0.5">
                      1536-Dimensional Embeddings • {analytics.vectorStats.totalVectors || 0} Ingested Chunks across {Object.keys(analytics.vectorStats.namespaces || {}).length} Namespaces
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#065F46]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>0.65 Cosine Guardrail Active</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">
                    Multi-Agent Verified
                  </span>
                </div>
              </div>

              {/* Active Namespaces Chips */}
              {analytics.vectorStats.namespaces && Object.keys(analytics.vectorStats.namespaces).length > 0 && (
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1F2937] flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF] uppercase tracking-wider mr-1">
                    Namespaces:
                  </span>
                  {Object.entries(analytics.vectorStats.namespaces).map(([ns, count]) => (
                    <span
                      key={ns}
                      className="px-2.5 py-1 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] text-xs font-medium text-[#0F172A] dark:text-[#F9FAFB] flex items-center space-x-1.5"
                    >
                      <span className="capitalize font-semibold">{ns}:</span>
                      <span className="font-mono text-[#059669] dark:text-[#10B981] font-bold">{count} chunks</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading or Error */}
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#059669] dark:text-[#10B981] mx-auto mb-2" />
              <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">Aggregating telemetry from vector index and MongoDB...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-3xl text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          ) : (
            <StatCards analytics={analytics} />
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
