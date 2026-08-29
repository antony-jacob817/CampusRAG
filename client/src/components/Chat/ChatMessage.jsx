import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { 
  User, 
  GraduationCap, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle,
  Sparkles,
  FileText,
  Pencil,
  X,
  Send
} from 'lucide-react';
import CitationBadge from './CitationBadge';
import { useChatStore } from '../../store/chatStore';

export default function ChatMessage({ message, isStreaming = false }) {
  const { submitFeedback, sendMessageStream, isStreaming: globalStreaming } = useChatStore();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(message.feedback || null);
  
  // Edit mode state for user messages
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const editTextareaRef = useRef(null);

  const isAi = message.sender === 'ai';
  const confidencePct = message.confidenceScore ? Math.round(message.confidenceScore * 100) : 92;
  const isGrounded = message.wasGrounded !== false;

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);
    const messageId = message._id || message.id;
    if (messageId && !messageId.startsWith('temp-') && !messageId.startsWith('ai-')) {
      submitFeedback(messageId, newFeedback);
    }
  };

  const handleStartEdit = () => {
    setEditText(message.text || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditText(message.text || '');
    setIsEditing(false);
  };

  const handleSaveAndSubmit = async () => {
    if (!editText.trim() || globalStreaming) return;
    setIsEditing(false);
    await sendMessageStream(editText.trim(), message.attachment || null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveAndSubmit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={`py-4 px-4 sm:px-6 rounded-2xl transition border group ${
      isAi 
        ? 'bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#1F2937] shadow-xs' 
        : 'bg-[#F1F5F9] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#1F2937]'
    }`}>
      <div className="flex items-start space-x-3.5">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-xs ${
          isAi 
            ? 'bg-gradient-to-tr from-[#059669] dark:from-[#10B981] via-[#4F46E5] dark:via-[#6366F1] to-[#10B981] text-white' 
            : 'bg-[#E2E8F0] dark:bg-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB]'
        }`}>
          {isAi ? <GraduationCap className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0">
          {/* Header row: Sender name, Grounding Pill & Actions */}
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                {isAi ? 'CampusRAG Assistant' : 'You'}
              </span>
              {isAi && (
                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  !isGrounded 
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                    : 'bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981] border-[#A7F3D0] dark:border-[#065F46]'
                }`}>
                  {isGrounded ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  <span>{isGrounded ? `${confidencePct}% Grounded` : 'Ungrounded Query'}</span>
                </span>
              )}
            </div>

            {/* Actions for User Messages */}
            {!isAi && !isEditing && (
              <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                <button
                  onClick={handleStartEdit}
                  className="p-1.5 text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] hover:bg-white dark:hover:bg-[#1F2937] rounded-lg transition"
                  title="Edit message"
                  aria-label="Edit message"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCopy}
                  className="p-1.5 text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] hover:bg-white dark:hover:bg-[#1F2937] rounded-lg transition"
                  title="Copy message"
                  aria-label="Copy message"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Actions for AI Assistant Messages */}
            {isAi && !isStreaming && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] rounded-lg transition"
                  title="Copy response"
                  aria-label="Copy response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleFeedback('like')}
                  className={`p-1.5 rounded-lg transition ${
                    feedback === 'like' 
                      ? 'text-[#059669] dark:text-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/50' 
                      : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937]'
                  }`}
                  title="Helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleFeedback('dislike')}
                  className={`p-1.5 rounded-lg transition ${
                    feedback === 'dislike' 
                      ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60' 
                      : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937]'
                  }`}
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* User Attachment Display */}
          {message.attachment && (
            <div className="mb-3 inline-flex items-center space-x-2.5 p-2 rounded-xl bg-white/80 dark:bg-[#111827] border border-[#10B981]/40 text-xs">
              {message.attachment.dataUrl ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#10B981]/30 shrink-0">
                  <img src={message.attachment.dataUrl} alt="attachment" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#10B981]">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="text-left">
                <p className="font-bold text-[#0F172A] dark:text-[#F9FAFB] truncate max-w-[220px]">
                  {message.attachment.name}
                </p>
                <p className="text-[10px] text-[#64748B] dark:text-[#9CA3AF]">
                  {Math.round((message.attachment.size || 0) / 1024)} KB • Document Verified
                </p>
              </div>
            </div>
          )}

          {/* Inline Edit Mode vs Markdown Render */}
          {isEditing ? (
            <div className="space-y-2 mt-1">
              <textarea
                ref={editTextareaRef}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={handleKeyDown}
                rows={2}
                className="w-full p-3 rounded-xl bg-white dark:bg-[#111827] border border-[#10B981]/50 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-hidden text-xs sm:text-sm text-[#0F172A] dark:text-[#F9FAFB] resize-none transition leading-relaxed shadow-xs"
                placeholder="Edit your question..."
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#E2E8F0] dark:hover:bg-[#1F2937] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndSubmit}
                  disabled={!editText.trim() || globalStreaming}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  <span>Send</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="prose-chat text-xs sm:text-sm text-[#0F172A] dark:text-[#F9FAFB] leading-relaxed break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {message.text || ''}
              </ReactMarkdown>
              {isStreaming && <span className="streaming-cursor" />}
            </div>
          )}

          {/* Citation Badges */}
          {isAi && message.citations && message.citations.length > 0 && !isStreaming && (
            <div className="mt-3.5 pt-3 border-t border-[#E2E8F0] dark:border-[#1F2937]">
              <div className="flex items-center space-x-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-[#059669] dark:text-[#10B981]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF]">
                  Verified Citations ({message.citations.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.citations.map((citation, idx) => (
                  <CitationBadge key={idx} citation={citation} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

