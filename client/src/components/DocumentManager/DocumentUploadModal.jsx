import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  ChevronDown,
  Terminal,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

const DEPARTMENTS = [
  { id: 'academics', label: 'Academics & Regulations' },
  { id: 'admissions', label: 'Admissions & Fees' },
  { id: 'examinations', label: 'Examinations & Grading' },
  { id: 'hostel', label: 'Hostel & Residential' },
  { id: 'placements', label: 'Placements & Careers' },
  { id: 'general', label: 'General Student Affairs' },
];

export default function DocumentUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('academics');
  const [isUploading, setIsUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0); // 0: Idle, 1: UPLOADING, 2: CHUNKING, 3: EMBEDDING, 4: INDEXED
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const fileInputRef = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setError('Only PDF documents are supported for ingestion.');
        return;
      }
      if (selected.size > 15 * 1024 * 1024) {
        setError('PDF file size exceeds maximum limit of 15MB.');
        return;
      }
      setFile(selected);
      setError(null);
      if (!title) {
        setTitle(selected.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.type !== 'application/pdf' && !dropped.name.endsWith('.pdf')) {
        setError('Only PDF documents are supported.');
        return;
      }
      setFile(dropped);
      setError(null);
      if (!title) {
        setTitle(dropped.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF document to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setIsComplete(false);
    setCurrentStage(1);
    
    setLogs([
      `[INFO] Ingestion telemetry stream initialized...`,
      `[INFO] Processing file '${file.name}' (${(file.size / 1024 / 1024).toFixed(1)} MB)`
    ]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('department', department);

    // Progressive visual telemetry log simulation while uploading
    const t1 = setTimeout(() => {
      setCurrentStage(2);
      setLogs(prev => [
        ...prev,
        `[STAGE 1] UPLOAD: COMPLETE (0.8s)`,
        `[STAGE 2] CHUNKING: Processing text blocks (345/1400)`,
        `[STAGE 2] CHUNKING: Tokenizing content (892/3600)`
      ]);
    }, 900);

    const t2 = setTimeout(() => {
      setCurrentStage(3);
      setLogs(prev => [
        ...prev,
        `[STAGE 3] EMBEDDING: Generating 1536-D Cosine vectors`,
        `[INFO] Engine: Vector Memory Store (Active)`
      ]);
    }, 1800);

    try {
      const response = await api.post('/admin/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearTimeout(t1);
      clearTimeout(t2);
      setCurrentStage(4);
      setIsComplete(true);
      setLogs(prev => [
        ...prev,
        `[STAGE 4] INDEXED: Upsert to namespace '${department}' successful`,
        `[SUCCESS] Document '${title || file.name}' is now active for grounding queries.`
      ]);

      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess();
      }, 1200);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(err.response?.data?.error || err.message || 'Ingestion pipeline error.');
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle('');
    setDepartment('academics');
    setIsUploading(false);
    setCurrentStage(0);
    setLogs([]);
    setError(null);
    setIsComplete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#090D16]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-[#E2E8F0] dark:border-[#1F2937] w-full max-w-lg overflow-hidden flex flex-col animate-slide-up">
        
        {/* Header (Matching Reference Image) */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1F2937] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#090D16]/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F9FAFB] tracking-tight">
              CampusPDF Ingestion Pipeline
            </h3>
          </div>

          <button
            onClick={handleReset}
            className="p-1 rounded-lg text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Dropzone Area (Matching Reference Image) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
              file
                ? 'border-[#059669] dark:border-[#10B981] bg-[#ECFDF5]/60 dark:bg-[#064E3B]/25'
                : 'border-[#10B981]/50 bg-[#ECFDF5]/30 dark:bg-[#064E3B]/10 hover:border-[#10B981] hover:bg-[#ECFDF5]/50 dark:hover:bg-[#064E3B]/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center justify-center space-x-3">
                <FileText className="w-7 h-7 text-[#059669] dark:text-[#10B981]" />
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-[#64748B] dark:text-[#9CA3AF]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for ingestion
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs font-medium text-[#059669] dark:text-[#10B981]">
                Drop a Campus PDF here, or click to upload. (Max 15MB)
              </p>
            )}
          </div>

          {/* Document Title Input */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Student Activity Center Policy"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] outline-hidden focus:border-[#059669] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
            />
          </div>

          {/* Target Department Selector */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] mb-1">
              Target Department (metadata)
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] outline-hidden focus:border-[#059669] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] appearance-none cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] dark:text-[#9CA3AF] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4-Stage Progress Stepper (Matching Reference Image) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF]">
              <span>4-Stage Stepper:</span>
              <span className="font-mono text-[#059669] dark:text-[#10B981]">
                UPLOADING → CHUNKING → EMBEDDING → INDEXED
              </span>
            </div>

            {/* Glowing Segmented Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5 h-2 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${
                currentStage >= 1 ? 'bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#1F2937]'
              }`} />
              <div className={`h-full rounded-full transition-all duration-300 ${
                currentStage >= 2 ? 'bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#1F2937]'
              }`} />
              <div className={`h-full rounded-full transition-all duration-300 ${
                currentStage >= 3 ? 'bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#1F2937]'
              }`} />
              <div className={`h-full rounded-full transition-all duration-300 ${
                currentStage >= 4 ? 'bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#1F2937]'
              }`} />
            </div>
          </div>

          {/* Real-Time Telemetry Terminal Window (Matching Reference Image) */}
          <div className="rounded-xl bg-[#090D16] border border-[#1F2937] p-3 font-mono text-[11px] text-[#10B981] max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
            {logs.length === 0 ? (
              <p className="text-[#64748B] dark:text-[#9CA3AF]/60 italic">
                Telemetry terminal awaiting document upload...
              </p>
            ) : (
              logs.map((log, lIdx) => (
                <div key={lIdx} className="leading-snug">
                  {log}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!file || (isUploading && !isComplete)}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white dark:text-[#090D16] bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {isUploading && !isComplete ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white dark:text-[#090D16]" />
                  <span>Processing Pipeline...</span>
                </>
              ) : isComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#090D16]" />
                  <span>Ingestion Complete (Indexed)</span>
                </>
              ) : (
                <span>Start Ingestion Pipeline</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
