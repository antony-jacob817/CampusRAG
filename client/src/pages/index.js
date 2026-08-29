import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Building, 
  BookOpen, 
  Briefcase, 
  Home, 
  Cpu, 
  Lock,
  Search,
  Layers,
  CheckCircle2,
  Link2,
  GitFork,
  Database,
  Send
} from 'lucide-react';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import { glideScrollTo } from '../utils/glideScroll';

export default function LandingPage() {
  const { user } = useAuthStore();
  const [activeSlide, setActiveSlide] = useState(0);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    glideScrollTo(targetId, 75);
  };

  // Exact Interactive Live Product Preview Scenarios
  const previewScenarios = [
    {
      domain: 'Admissions & Scholarships',
      query: 'What is the CGPA requirement for the merit scholarship?',
      streamedText:
        'Harness CampusRAG\'s multi-agent engine to deliver instantly referenceable, accurate information from official institutional documents to students and administrators.',
      citation: 'Admissions & Fee Regulations 2026-2027, Page 2',
      matchScore: '94% Match',
      link: '/chat'
    },
    {
      domain: 'Academic Credit System',
      query: 'Can I condone attendance between 65% and 74%?',
      streamedText:
        'Condonation is permissible strictly for authorized medical leave or inter-college events, subject to Dean approval and required administrative documentation.',
      citation: 'Academic Regulations & Course Credit System, Page 1',
      matchScore: '92% Match',
      link: '/chat'
    },
    {
      domain: 'Examinations & Grading',
      query: 'How is CGPA calculated from course credits and grades?',
      streamedText:
        'Cumulative Grade Point Average (CGPA) is computed as the weighted sum of course credits multiplied by earned grade points, divided by the total registered credits on a 10.0 scale.',
      citation: 'Examination Rules, Grading Scheme & Revaluation Manual, Page 1',
      matchScore: '96% Match',
      link: '/chat'
    },
    {
      domain: 'Hostel & Residential Life',
      query: 'What is the hostel night-out curfew and leave procedure?',
      streamedText:
        'Mandatory biometric entry curfew is 9:30 PM. Overnight leave passes require digital parent authorization submitted through the residential portal 24 hours in advance.',
      citation: 'Hostel Code of Conduct & Residential Regulations, Page 1',
      matchScore: '95% Match',
      link: '/chat'
    },
    {
      domain: 'Placements & Internships',
      query: 'What qualifies as a dream company offer during campus drives?',
      streamedText:
        'A Dream Offer is classified as any confirmed compensation package exceeding ₹12.0 LPA or 2.0x of the first accepted placement offer.',
      citation: 'Placement Guidelines, Internship Policy & Code of Conduct, Page 1',
      matchScore: '91% Match',
      link: '/chat'
    }
  ];

  const currentPreview = previewScenarios[activeSlide];

  return (
    <AppShell showSidebar={false}>
      <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F9FAFB] bg-tech-grid transition-colors overflow-hidden">
        
        {/* Layered Vibrant Neon Background Glows (Matching Reference) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] sm:w-[1000px] h-[650px] bg-gradient-to-b from-[#10B981]/25 via-[#10B981]/12 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-[380px] left-1/2 translate-x-[-15%] sm:translate-x-[5%] w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] bg-[#10B981]/30 dark:bg-[#10B981]/35 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-[850px] right-5 w-[500px] h-[500px] bg-gradient-to-br from-[#6366F1]/15 via-transparent to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* HERO SECTION */}
        <section id="engine" className="pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
          
          {/* Top Pill Guardrail Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#ECFDF5] dark:bg-[#111827] text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#1F2937] shadow-xs mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Strict 0.65 Cosine Guardrail Active</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F9FAFB] leading-[1.15] max-w-4xl">
            Verifiable, Grounded Answers{' '}
            <br className="hidden sm:inline" />
            <span className="text-[#059669] dark:text-[#10B981]">
              to Campus Regulations
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-[#64748B] dark:text-[#9CA3AF] leading-relaxed max-w-2xl mx-auto">
            Harness CampusRAG's multi-agent engine to deliver instantly referenceable, accurate information from official institutional documents to students and administrators.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <Link
              href={user ? '/chat' : '/login'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold text-white dark:text-[#090D16] bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] shadow-lg shadow-[#10B981]/25 transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>{user ? 'Open Academic Assistant' : 'Launch Student Assistant'}</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold text-[#0F172A] dark:text-[#F9FAFB] bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#0F172A] transition-all duration-200 active:scale-95 flex items-center justify-center shadow-xs"
            >
              <span>Admin Portal Login</span>
            </Link>
          </div>

          {/* Live Centerpiece Interactive Product Preview Card */}
          <div className="mt-14 w-full max-w-3xl relative">
            {/* Diffuse Neon Glow Behind Card */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#10B981]/40 via-emerald-400/30 to-[#10B981]/20 rounded-[36px] blur-2xl opacity-90 transition duration-1000 -z-10" />

            <div className="relative bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-2xl border border-[#E2E8F0] dark:border-[#10B981]/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_-10px_rgba(16,185,129,0.35)] dark:shadow-[0_0_70px_-10px_rgba(16,185,129,0.45)] text-left space-y-4">
              
              {/* Simulated Query Prompt Input Surface */}
              <div className="flex items-center justify-between bg-[#F1F5F9] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] rounded-2xl px-4 py-3 shadow-inner">
                <span className="text-xs sm:text-sm font-medium text-[#0F172A] dark:text-[#F9FAFB] truncate">
                  {currentPreview.query}
                </span>
                <Link
                  href={user ? '/chat' : '/login'}
                  className="w-8 h-8 rounded-xl bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#090D16] flex items-center justify-center shrink-0 ml-2 hover:scale-105 transition-transform"
                  title="Run Query in Assistant"
                >
                  <Send className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Streaming AI Answer Window */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#059669] dark:text-[#10B981]">
                  <span>Real-time retrieval streaming</span>
                  <span className="tracking-widest animate-pulse font-mono">ılı</span>
                </div>

                <p className="text-xs sm:text-sm text-[#0F172A] dark:text-[#F9FAFB] leading-relaxed font-normal">
                  {currentPreview.streamedText}
                </p>
              </div>

              {/* Verified Source Citation Box */}
              <div className="pt-2">
                <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] text-xs text-[#64748B] dark:text-[#9CA3AF] max-w-full">
                  <Link2 className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981] shrink-0" />
                  <span className="truncate">
                    <strong className="text-[#0F172A] dark:text-[#F9FAFB]">Citation:</strong> {currentPreview.citation}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981] font-bold text-[10px] shrink-0">
                    {currentPreview.matchScore}
                  </span>
                </div>
              </div>

              {/* Scenario Slider Dots */}
              <div className="pt-3 flex items-center justify-center space-x-2">
                {previewScenarios.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeSlide === idx 
                        ? 'w-6 bg-[#059669] dark:bg-[#10B981]' 
                        : 'w-2 bg-[#E2E8F0] dark:bg-[#1F2937] hover:bg-[#64748B]'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Product Preview Tag */}
            <div className="mt-5 flex justify-center">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold text-[#64748B] dark:text-[#9CA3AF] bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937]">
                <span>Product Preview</span>
              </div>
            </div>
          </div>
        </section>

        {/* ARCHITECTURE BENTO GRID */}
        <section id="architecture" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E2E8F0] dark:border-[#1F2937]/70">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F9FAFB] tracking-tight">
              Architecture Bento Grid
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF]">
              Multi-Agent Engine with subtle 1px borders, and custom technical glyphs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Router Agent */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Router Agent
                  </h3>
                  <span className="text-[11px] font-semibold text-[#059669] dark:text-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/30 px-2.5 py-0.5 rounded-full border border-[#A7F3D0] dark:border-[#065F46]">
                    Namespace Routing
                  </span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] leading-relaxed mb-6">
                  Analyzes prompt semantic intent, detects target campus category, and isolates vector namespace queries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] rounded-2xl p-3.5 flex flex-col items-center text-center space-y-2">
                  <GitFork className="w-5 h-5 text-[#059669] dark:text-[#10B981]" />
                  <span className="text-[11px] font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Query Classification
                  </span>
                </div>

                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] rounded-2xl p-3.5 flex flex-col items-center text-center space-y-2">
                  <Database className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />
                  <span className="text-[11px] font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Knowledge Base Selection
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Retrieval Agent */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Retrieval Agent
                  </h3>
                  <span className="text-[11px] font-semibold text-[#4F46E5] dark:text-[#A5B4FC] bg-[#EEF2FF] dark:bg-[#1E1B4B]/60 px-2.5 py-0.5 rounded-full border border-[#C7D2FE] dark:border-[#3730A3]">
                    Top-4 Cosine
                  </span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] leading-relaxed mb-6">
                  Executes dense vector similarity search across Pinecone & in-memory stores, collecting top-k relevant PDF chunks.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] rounded-2xl p-3.5 flex flex-col items-center text-center space-y-2">
                  <Search className="w-5 h-5 text-[#059669] dark:text-[#10B981]" />
                  <span className="text-[11px] font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Semantic Search
                  </span>
                </div>

                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] rounded-2xl p-3.5 flex flex-col items-center text-center space-y-2">
                  <Layers className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />
                  <span className="text-[11px] font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Context Assembly
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Grounding Validation & Citation Agents */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F9FAFB]">
                    Grounding & Citations
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                    Strict Verification
                  </span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] leading-relaxed mb-6">
                  Validates similarity metrics against 0.65 threshold, formats page-level references, and halts false hallucinations.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] rounded-2xl p-2.5 flex flex-col items-center text-center space-y-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] font-bold text-[#0F172A] dark:text-[#F9FAFB] leading-tight">
                    Hallucination Check
                  </span>
                </div>

                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] rounded-2xl p-2.5 flex flex-col items-center text-center space-y-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-[#10B981]" />
                  <span className="text-[10px] font-bold text-[#0F172A] dark:text-[#F9FAFB] leading-tight">
                    Accuracy Verified
                  </span>
                </div>

                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] rounded-2xl p-2.5 flex flex-col items-center text-center space-y-1.5">
                  <Link2 className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                  <span className="text-[10px] font-bold text-[#0F172A] dark:text-[#F9FAFB] leading-tight">
                    Source Attribution
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* INTERACTIVE PRE-INDEXED KNOWLEDGE SHOWCASE */}
        <section id="showcase" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E2E8F0] dark:border-[#1F2937]/70">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F9FAFB] tracking-tight">
              Interactive Pre-Indexed Knowledge Showcase
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF]">
              Real-time query badges in segment; via coordinate retrieval sections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Domain 1: Admissions */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xs flex flex-col justify-between hover:border-[#059669] dark:hover:border-[#10B981] transition group">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F9FAFB] mb-3">
                  Admissions
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Filters</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Students</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Admissions Reg</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1F2937]">
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#059669] dark:text-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/30 px-3 py-1 rounded-full border border-[#A7F3D0] dark:border-[#065F46] w-full justify-center">
                  <span>124 Active Queries</span>
                </div>
              </div>
            </div>

            {/* Domain 2: Academics */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xs flex flex-col justify-between hover:border-[#059669] dark:hover:border-[#10B981] transition group">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F9FAFB] mb-3">
                  Academics
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Filter</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Filters</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Academics</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1F2937]">
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#059669] dark:text-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/30 px-3 py-1 rounded-full border border-[#A7F3D0] dark:border-[#065F46] w-full justify-center">
                  <span>186 Active Queries</span>
                </div>
              </div>
            </div>

            {/* Domain 3: Exams */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xs flex flex-col justify-between hover:border-[#059669] dark:hover:border-[#10B981] transition group">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F9FAFB] mb-3">
                  Exams
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Filter</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Student</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Academics</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1F2937]">
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#059669] dark:text-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/30 px-3 py-1 rounded-full border border-[#A7F3D0] dark:border-[#065F46] w-full justify-center">
                  <span>70 Recent Lookups</span>
                </div>
              </div>
            </div>

            {/* Domain 4: Hostel */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xs flex flex-col justify-between hover:border-[#059669] dark:hover:border-[#10B981] transition group">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F9FAFB] mb-3">
                  Hostel
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Filters</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Filters</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Evaluation</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1F2937]">
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#059669] dark:text-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/30 px-3 py-1 rounded-full border border-[#A7F3D0] dark:border-[#065F46] w-full justify-center">
                  <span>80 Recent Lookups</span>
                </div>
              </div>
            </div>

            {/* Domain 5: Placements */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-[#E2E8F0] dark:border-[#1F2937] shadow-xs flex flex-col justify-between hover:border-[#059669] dark:hover:border-[#10B981] transition group">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F9FAFB] mb-3">
                  Placements
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Floats</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Filters</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]">Placements</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1F2937]">
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#059669] dark:text-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/30 px-3 py-1 rounded-full border border-[#A7F3D0] dark:border-[#065F46] w-full justify-center">
                  <span>60 Recent Lookups</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* TECHNICAL STATUS FOOTER */}
        <footer id="docs" className="border-t border-[#E2E8F0] dark:border-[#1F2937]/80 bg-white/70 dark:bg-[#090D16]/90 backdrop-blur-md py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Status Bar Container */}
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <div className="flex items-center space-x-2 text-[#0F172A] dark:text-[#F9FAFB] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span>System Status: All Systems Operational</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-[#64748B] dark:text-[#9CA3AF]">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Data Integrity: Verified (0.65 Cosine)</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-[#059669] dark:text-[#10B981] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Support: 24/7 Active</span>
            </div>
          </div>

          {/* Bottom Copyright & Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B] dark:text-[#9CA3AF] font-medium">
            <div className="flex items-center space-x-5">
              <a 
                href="#engine" 
                onClick={(e) => handleSmoothScroll(e, 'engine')}
                className="hover:text-[#059669] dark:hover:text-[#10B981] transition cursor-pointer"
              >
                Engine
              </a>
              <a 
                href="#architecture" 
                onClick={(e) => handleSmoothScroll(e, 'architecture')}
                className="hover:text-[#059669] dark:hover:text-[#10B981] transition cursor-pointer"
              >
                Architecture
              </a>
              <a 
                href="#showcase" 
                onClick={(e) => handleSmoothScroll(e, 'showcase')}
                className="hover:text-[#059669] dark:hover:text-[#10B981] transition cursor-pointer"
              >
                Showcase
              </a>
            </div>

            <p>© 2026 CampusRAG. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </AppShell>
  );
}
