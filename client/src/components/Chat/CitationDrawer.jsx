import React from 'react';
import { useChatStore } from '../../store/chatStore';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Copy, 
  Check
} from 'lucide-react';

export default function CitationDrawer() {
  const { selectedCitation, isCitationDrawerOpen, closeCitationDrawer } = useChatStore();
  const [copied, setCopied] = React.useState(false);

  if (!isCitationDrawerOpen || !selectedCitation) return null;

  const scorePct = Math.round((selectedCitation.similarityScore || 0) * 100);

  const handleCopySnippet = () => {
    if (selectedCitation.snippet) {
      navigator.clipboard.writeText(selectedCitation.snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#090D16]/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-[#E2E8F0] dark:border-[#1F2937] w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1F2937] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#090D16]/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#065F46]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                Grounded Source Citation
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                Verified extraction from campus vector database
              </p>
            </div>
          </div>

          <button
            onClick={closeCitationDrawer}
            className="p-1.5 rounded-xl text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#1F2937]">
              <span className="text-[10px] font-bold text-[#64748B] dark:text-[#9CA3AF] uppercase tracking-wider block">
                Document
              </span>
              <span className="text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] truncate block mt-0.5" title={selectedCitation.title}>
                {selectedCitation.title}
              </span>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#1F2937]">
              <span className="text-[10px] font-bold text-[#64748B] dark:text-[#9CA3AF] uppercase tracking-wider block">
                Page / Chunk
              </span>
              <span className="text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] flex items-center mt-0.5">
                <BookOpen className="w-3.5 h-3.5 mr-1 text-[#4F46E5] dark:text-[#6366F1]" />
                Page {selectedCitation.pageNumber || 1} • #{selectedCitation.chunkIndex || 0}
              </span>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#1F2937] col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-[#64748B] dark:text-[#9CA3AF] uppercase tracking-wider block">
                Relevance Match
              </span>
              <span className="text-xs font-bold text-[#059669] dark:text-[#10B981] flex items-center mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                {scorePct}% Match
              </span>
            </div>
          </div>

          {/* Extracted Chunk Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#059669] dark:text-[#10B981]" />
                Verified Text Context Snippet
              </label>

              <button
                onClick={handleCopySnippet}
                className="text-xs text-[#059669] dark:text-[#10B981] font-semibold hover:underline flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="bg-[#F1F5F9] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F9FAFB] p-4 rounded-2xl text-xs leading-relaxed font-mono whitespace-pre-wrap border border-[#E2E8F0] dark:border-[#1F2937] shadow-inner">
              {selectedCitation.snippet || 'No text snippet available.'}
            </div>
          </div>

          <div className="bg-[#ECFDF5] dark:bg-[#064E3B]/20 border border-[#A7F3D0] dark:border-[#065F46]/50 rounded-2xl p-3.5 text-xs text-[#065F46] dark:text-[#A7F3D0]">
            <p className="font-bold mb-0.5">Academic Integrity & Grounding Note</p>
            <p className="text-[11px] leading-relaxed">This snippet was retrieved directly from the verified campus handbook in vector memory. The AI was bounded strictly to this text to prevent hallucination.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E2E8F0] dark:border-[#1F2937] flex justify-end bg-[#F8FAFC] dark:bg-[#090D16]/50">
          <button
            onClick={closeCitationDrawer}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#E2E8F0] dark:bg-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] hover:bg-[#CBD5E1] dark:hover:bg-[#374151] transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
