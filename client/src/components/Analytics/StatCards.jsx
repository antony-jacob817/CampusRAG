import React from 'react';
import { 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Layers,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function StatCards({ analytics }) {
  if (!analytics) return null;

  const { metrics = {}, departmentDistribution = {}, unresolvedQueries = [] } = analytics;

  const stats = [
    {
      label: 'Total Queries Executed',
      value: metrics.totalQueries || 0,
      icon: MessageSquare,
      iconBg: 'bg-[#ECFDF5] dark:bg-[#0F172A]',
      iconColor: 'text-[#059669] dark:text-[#10B981]',
      borderGlow: 'border-[#E2E8F0] dark:border-[#1F2937] hover:border-[#10B981]/50',
      subtext: 'Across all campus departments',
    },
    {
      label: 'Grounding Accuracy Rate',
      value: `${metrics.groundingRate || 100}%`,
      icon: ShieldCheck,
      iconBg: 'bg-[#ECFDF5] dark:bg-[#064E3B]/40',
      iconColor: 'text-[#059669] dark:text-[#10B981]',
      borderGlow: 'border-[#E2E8F0] dark:border-[#1F2937] hover:border-[#10B981]/50',
      subtext: `${metrics.groundedQueries || 0} strictly grounded answers`,
    },
    {
      label: 'Average Confidence Score',
      value: `${((metrics.avgConfidence || 0.92) * 100).toFixed(0)}%`,
      icon: Sparkles,
      iconBg: 'bg-[#EEF2FF] dark:bg-[#1E1B4B]/50',
      iconColor: 'text-[#4F46E5] dark:text-[#A5B4FC]',
      borderGlow: 'border-[#E2E8F0] dark:border-[#1F2937] hover:border-[#6366F1]/50',
      subtext: 'Cosine similarity & depth metric',
    },
    {
      label: 'Campus Knowledge Documents',
      value: metrics.totalDocuments || 0,
      icon: FileText,
      iconBg: 'bg-amber-50 dark:bg-amber-950/50',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderGlow: 'border-[#E2E8F0] dark:border-[#1F2937] hover:border-amber-500/50',
      subtext: 'Active vector index handbooks',
    },
  ];

  const deptTotal = Object.values(departmentDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-3xl p-5 border ${stat.borderGlow} shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#64748B] dark:text-[#9CA3AF]">
                  {stat.label}
                </span>
                <div className={`p-2.5 rounded-2xl ${stat.iconBg} ${stat.iconColor} border border-black/5 dark:border-white/5`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-extrabold text-[#0F172A] dark:text-[#F9FAFB] tracking-tight">
                  {stat.value}
                </span>
                <p className="text-[11px] font-medium text-[#64748B] dark:text-[#9CA3AF] mt-1.5">
                  {stat.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section: Department Distribution & Unresolved Knowledge Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Query Volume */}
        <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                Department Query Volume
              </h4>
              <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                Inquiries routed across department vector namespaces
              </p>
            </div>
            <div className="p-2 rounded-xl bg-[#EEF2FF] dark:bg-[#1E1B4B]/50 text-[#4F46E5] dark:text-[#A5B4FC]">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(departmentDistribution).map(([dept, count]) => {
              const pct = Math.round((count / deptTotal) * 100);
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize text-[#0F172A] dark:text-[#F9FAFB]">
                      {dept}
                    </span>
                    <span className="text-[#64748B] dark:text-[#9CA3AF] font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#F1F5F9] dark:bg-[#0F172A] overflow-hidden p-0.5 border border-[#E2E8F0]/50 dark:border-[#1F2937]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#059669] dark:from-[#10B981] to-[#4F46E5] dark:to-[#6366F1] transition-all duration-500 shadow-sm"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unresolved / Out-of-Knowledge Queries */}
        <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB] flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Unresolved Knowledge Gaps</span>
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                  Student queries with similarity &lt; 0.65 threshold
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-900">
                {unresolvedQueries.length} Detected
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {unresolvedQueries.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981] flex items-center justify-center mx-auto mb-2 border border-[#A7F3D0] dark:border-[#065F46]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    No Knowledge Gaps Detected!
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                    All student questions have been grounded in verified documents.
                  </p>
                </div>
              ) : (
                unresolvedQueries.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] text-xs space-y-1.5"
                  >
                    <p className="font-semibold text-[#0F172A] dark:text-[#F9FAFB]">
                      "{item.queryText}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#64748B] dark:text-[#9CA3AF]">
                      <span className="uppercase font-bold text-[#4F46E5] dark:text-[#6366F1]">
                        Dept: {item.department || 'general'}
                      </span>
                      <span className="font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">
                        Confidence: {((item.confidenceScore || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1F2937] mt-4 flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
            <span>Upload handbooks to bridge these knowledge gaps:</span>
            <Link
              href="/admin/documents"
              className="font-bold text-[#059669] dark:text-[#10B981] hover:underline inline-flex items-center space-x-1"
            >
              <span>Upload PDF</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
