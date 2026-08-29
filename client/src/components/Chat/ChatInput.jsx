import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, FileText, Image as ImageIcon, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

const DEPARTMENT_LABELS = {
  all: 'All Departments',
  admissions: 'Admissions & Fees',
  academics: 'Academics',
  examinations: 'Exams',
  hostel: 'Hostel',
  placements: 'Placements',
};

export default function ChatInput({ placeholder = 'Ask any campus regulation or policy...' }) {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { sendMessageStream, isStreaming, selectedDepartment } = useChatStore();

  const activeDeptLabel = DEPARTMENT_LABELS[selectedDepartment || 'all'] || 'All Departments';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (PDF or Image only)
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Only PDF documents and Images (PNG, JPEG, WEBP) are supported.');
      return;
    }

    // Generate preview dataUrl if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setAttachedFile({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: loadEvt.target.result,
          rawFile: file,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setAttachedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: null,
        rawFile: file,
      });
    }

    // Reset file input so same file can be selected again if needed
    e.target.value = '';
  };

  const removeAttachment = () => {
    setAttachedFile(null);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const query = input.trim();
    if ((!query && !attachedFile) || isStreaming) return;

    const attachmentPayload = attachedFile ? { ...attachedFile } : null;

    setInput('');
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    sendMessageStream(query, attachmentPayload);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2">
      {/* Hidden File Input for PDF & Images */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Attachment Preview Chip */}
      {attachedFile && (
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-[#10B981]/50 shadow-md text-xs text-[#0F172A] dark:text-[#F9FAFB] animate-fade-in">
          {attachedFile.type.startsWith('image/') ? (
            <div className="w-5 h-5 rounded overflow-hidden shrink-0 border border-[#10B981]">
              <img src={attachedFile.dataUrl} alt="preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <FileText className="w-4 h-4 text-[#10B981] shrink-0" />
          )}

          <span className="font-semibold max-w-[200px] truncate">{attachedFile.name}</span>
          <span className="text-[10px] text-[#64748B] dark:text-[#9CA3AF]">
            ({Math.round(attachedFile.size / 1024)} KB)
          </span>

          <button
            type="button"
            onClick={removeAttachment}
            className="p-0.5 rounded-full hover:bg-rose-500/20 text-[#64748B] hover:text-rose-400 transition"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Floating Query Prompt Pill Container */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-2xl rounded-2xl sm:rounded-full border border-[#E2E8F0] dark:border-[#1F2937] px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xl focus-within:border-[#059669] dark:focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 transition">
          
          {/* Paperclip Attachment Button */}
          <button
            type="button"
            onClick={handleFileClick}
            className={`p-1.5 transition shrink-0 mr-1.5 rounded-lg ${
              attachedFile 
                ? 'text-[#059669] dark:text-[#10B981] bg-[#10B981]/15' 
                : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#059669] dark:hover:text-[#10B981] hover:bg-[#10B981]/10'
            }`}
            title="Attach PDF or Image document"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Domain Pill Badge */}
          <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] dark:bg-[#111827] text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#1F2937] shrink-0 mr-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Domain: {activeDeptLabel}</span>
          </div>

          {/* Text Input (Completely Borderless & Seamless) */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={attachedFile ? `Ask a question about ${attachedFile.name}...` : placeholder}
            className="w-full py-1 text-xs sm:text-sm text-[#0F172A] dark:text-[#F9FAFB] bg-transparent resize-none border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent placeholder-[#64748B] dark:placeholder-[#9CA3AF] max-h-32 shadow-none"
            style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && !attachedFile) || isStreaming}
            className="w-9 h-9 rounded-full bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#090D16] hover:bg-[#047857] dark:hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#10B981]/25 transition transform active:scale-95 flex items-center justify-center shrink-0 ml-2"
            title="Send query (Enter)"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin text-white dark:text-[#090D16]" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
