import React from 'react';
import { useChatStore } from '../../store/chatStore';
import { FileText, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function CitationBadge({ citation }) {
  const { openCitationDrawer } = useChatStore();

  if (!citation) return null;

  const scorePct = Math.round((citation.similarityScore || 0) * 100);

  return (
    <button
      onClick={() => openCitationDrawer(citation)}
      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#F1F5F9] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F9FAFB] border border-[#E2E8F0] dark:border-[#1F2937] hover:border-[#059669] dark:hover:border-[#10B981] hover:bg-[#ECFDF5] dark:hover:bg-[#111827] transition shadow-2xs group"
      title="Click to view verified source context"
    >
      <FileText className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981] group-hover:scale-110 transition-transform" />
      <span className="max-w-[160px] sm:max-w-[220px] truncate font-semibold">
        {citation.title}
      </span>
      <span className="text-[10px] px-1.5 py-0.2 bg-[#E2E8F0] dark:bg-[#1F2937] rounded-md text-[#64748B] dark:text-[#9CA3AF]">
        p.{citation.pageNumber || 1}
      </span>
      {scorePct > 0 && (
        <span className="text-[10px] text-[#059669] dark:text-[#10B981] flex items-center font-bold">
          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" />
          {scorePct}%
        </span>
      )}
      <ExternalLink className="w-3 h-3 text-[#64748B] dark:text-[#9CA3AF] opacity-60 group-hover:opacity-100" />
    </button>
  );
}
