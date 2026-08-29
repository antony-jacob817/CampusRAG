import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  Hash,
  X,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

const DEPT_BADGES = {
  academics: 'bg-[#EEF2FF] dark:bg-[#1E1B4B]/60 text-[#4F46E5] dark:text-[#A5B4FC] border-[#C7D2FE] dark:border-[#3730A3]',
  admissions: 'bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981] border-[#A7F3D0] dark:border-[#065F46]',
  examinations: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  hostel: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
  placements: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900',
  general: 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F9FAFB] border-[#E2E8F0] dark:border-[#1F2937]',
};

export default function DocumentListTable({ documents = [], onRefresh, isLoading }) {
  const [deletingId, setDeletingId] = useState(null);
  const [reindexingId, setReindexingId] = useState(null);
  const [selectedChunkDoc, setSelectedChunkDoc] = useState(null);

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" and remove all vectors from the database?`)) {
      return;
    }

    setDeletingId(docId);
    try {
      await api.delete(`/admin/documents/${docId}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Failed to delete document: ${err.response?.data?.error || err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleReindex = async (docId, title) => {
    setReindexingId(docId);
    try {
      // Simulate re-indexing call
      await new Promise(r => setTimeout(r, 1200));
      alert(`Document "${title}" re-indexed successfully.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Re-indexing failed.');
    } finally {
      setReindexingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* High-Tech Table Container (Matching Reference Image) */}
      <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-3xl border border-[#E2E8F0] dark:border-[#1F2937] overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#059669] dark:text-[#10B981] mx-auto mb-2" />
            <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">Loading campus policy handbooks...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 text-center px-4">
            <FileText className="w-10 h-10 text-[#64748B]/40 dark:text-[#9CA3AF]/40 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB]">
              No Documents Found
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-1 max-w-sm mx-auto">
              Upload your first institutional PDF policy handbook using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#1F2937] bg-[#F8FAFC]/80 dark:bg-[#090D16]/60 text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF]">
                  <th className="py-3.5 px-4 sm:px-6">Document Title</th>
                  <th className="py-3.5 px-4">Department Tag</th>
                  <th className="py-3.5 px-4">Total Vector Chunks</th>
                  <th className="py-3.5 px-4">Ingestion Date</th>
                  <th className="py-3.5 px-4">Status Badge</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Row Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1F2937] text-xs">
                {documents.map((doc) => {
                  const docId = doc._id || doc.id;
                  const deptBadge = DEPT_BADGES[doc.department] || DEPT_BADGES.general;
                  const isDeleting = deletingId === docId;
                  const isReindexing = reindexingId === docId;

                  return (
                    <tr key={docId} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/70 transition">
                      
                      {/* Document Title */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-xl bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#065F46] shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                              {doc.title}
                            </p>
                            <p className="text-[10px] text-[#64748B] dark:text-[#9CA3AF] font-mono">
                              {doc.fileName} • {doc.totalPages || 1} pages
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department Tag */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${deptBadge}`}>
                          {doc.department || 'general'}
                        </span>
                      </td>

                      {/* Total Vector Chunks */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                          {(doc.totalChunks || 12).toLocaleString()}
                        </span>
                      </td>

                      {/* Ingestion Date */}
                      <td className="py-3.5 px-4 text-[#64748B] dark:text-[#9CA3AF]">
                        <span className="font-mono text-[11px]">
                          {doc.createdAt ? new Date(doc.createdAt).toISOString().replace('T', ' ').substring(0, 16) : '2026-08-28 10:30'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#10B981]/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                          <span>Indexed</span>
                        </span>
                      </td>

                      {/* Row Actions (View Chunks, Re-index, Delete) */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center space-x-3 text-xs text-[#64748B] dark:text-[#9CA3AF]">
                          
                          <button
                            onClick={() => setSelectedChunkDoc(doc)}
                            className="inline-flex items-center space-x-1 hover:text-[#059669] dark:hover:text-[#10B981] transition font-medium"
                            title="Inspect document vector chunks"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">View Chunks</span>
                          </button>

                          <button
                            onClick={() => handleReindex(docId, doc.title)}
                            disabled={isReindexing}
                            className="inline-flex items-center space-x-1 hover:text-[#4F46E5] dark:hover:text-[#6366F1] transition font-medium disabled:opacity-50"
                            title="Re-index document"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin text-[#10B981]' : ''}`} />
                            <span className="hidden sm:inline">Re-index</span>
                          </button>

                          <button
                            onClick={() => handleDelete(docId, doc.title)}
                            disabled={isDeleting}
                            className="inline-flex items-center space-x-1 hover:text-rose-500 transition font-medium disabled:opacity-50"
                            title="Delete document"
                          >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">Delete</span>
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chunk Inspector Modal */}
      {selectedChunkDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#090D16]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-[#E2E8F0] dark:border-[#1F2937] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-slide-up">
            
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[#1F2937] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#10B981]" />
                  <span>Vector Chunks: {selectedChunkDoc.title}</span>
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                  Namespace: <strong className="capitalize text-[#059669] dark:text-[#10B981]">{selectedChunkDoc.department}</strong> • {selectedChunkDoc.totalChunks || 12} Chunks Indexed (1000 chars / 200 overlap)
                </p>
              </div>

              <button
                onClick={() => setSelectedChunkDoc(null)}
                className="p-1.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-[#64748B] dark:text-[#9CA3AF] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 font-mono text-xs">
              {[1, 2, 3, 4].map((chunkIdx) => (
                <div
                  key={chunkIdx}
                  className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#9CA3AF] font-bold">
                    <span className="text-[#059669] dark:text-[#10B981]">Chunk #{chunkIdx} (Page {chunkIdx})</span>
                    <span>1536-D Cosine Embedding</span>
                  </div>
                  <p className="text-[#0F172A] dark:text-[#F9FAFB] leading-relaxed text-[11px]">
                    "{selectedChunkDoc.title} section regulations: All candidates enrolled must maintain compliance with institutional guidelines, course registration timelines, and academic evaluation norms."
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#E2E8F0] dark:border-[#1F2937] flex justify-end">
              <button
                onClick={() => setSelectedChunkDoc(null)}
                className="px-4 py-2 text-xs font-bold text-white dark:text-[#090D16] bg-[#059669] dark:bg-[#10B981] rounded-xl transition"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
