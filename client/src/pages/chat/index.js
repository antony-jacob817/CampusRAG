import React from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import DepartmentSelector from '../../components/Chat/DepartmentSelector';
import ChatInput from '../../components/Chat/ChatInput';
import CitationDrawer from '../../components/Chat/CitationDrawer';
import { useChatStore } from '../../store/chatStore';
import { ArrowRight, Sparkles } from 'lucide-react';

const EXPLORATION_CARDS = {
  all: [
    { title: 'How to declare a minor in Artificial Intelligence?', tags: ['Academics', 'Minors'] },
    { title: 'What is the credit policy for summer internships?', tags: ['Academics', 'All'] },
    { title: 'What is the attendance condonation rule for exams?', tags: ['Examinations', 'Exam'] },
    { title: 'What is the hostel night-out curfew procedure?', tags: ['Hostel', 'Residential'] },
    { title: 'What qualifies as a dream company offer during drives?', tags: ['Placements', 'CTC'] },
    { title: 'How is CGPA calculated from course credits?', tags: ['Examinations', 'Grading'] },
  ],
  admissions: [
    { title: 'What is the CGPA requirement for merit scholarships?', tags: ['Admissions', 'Scholarships'] },
    { title: 'What is the tuition fee refund policy upon withdrawal?', tags: ['Admissions', 'Refunds'] },
    { title: 'What documents are required for international student registration?', tags: ['Admissions', 'Docs'] },
    { title: 'Is there an installment option for semester tuition fees?', tags: ['Admissions', 'Installments'] },
    { title: 'How to apply for financial aid or fee concession?', tags: ['Admissions', 'Aid'] },
    { title: 'What is the deadline for fee submission without penalty?', tags: ['Admissions', 'Deadlines'] },
  ],
  academics: [
    { title: 'What is the maximum course credit registration limit?', tags: ['Academics', 'Credits'] },
    { title: 'How to register for an interdisciplinary elective course?', tags: ['Academics', 'Electives'] },
    { title: 'What is the criteria for graduating with an Honors degree?', tags: ['Academics', 'Honors'] },
    { title: 'Can an elective course be dropped after the 2nd week?', tags: ['Academics', 'Course Drop'] },
    { title: 'What are the credit requirements for a minor specialization?', tags: ['Academics', 'Minors'] },
    { title: 'What is the minimum 75% attendance rule and medical exemptions?', tags: ['Academics', 'Attendance'] },
  ],
  examinations: [
    { title: 'How is SGPA and CGPA calculated under the 10-point scale?', tags: ['Exams', 'Grading'] },
    { title: 'What is the procedure and fee for end-sem paper revaluation?', tags: ['Exams', 'Revaluation'] },
    { title: 'When are supplementary exams scheduled each academic year?', tags: ['Exams', 'Supplementary'] },
    { title: 'What constitutes an automatic course backlog or repeat?', tags: ['Exams', 'Backlogs'] },
    { title: 'What are the disciplinary penalties for exam malpractice?', tags: ['Exams', 'Conduct'] },
    { title: 'How to request an official academic transcript or duplicate grade card?', tags: ['Exams', 'Transcripts'] },
  ],
  hostel: [
    { title: 'What is the hostel night-out curfew and biometric entry timing?', tags: ['Hostel', 'Curfew'] },
    { title: 'What is the procedure for mess rebate on leaves exceeding 4 days?', tags: ['Hostel', 'Mess'] },
    { title: 'Are high-power electrical appliances allowed in residential rooms?', tags: ['Hostel', 'Appliances'] },
    { title: 'What are the visiting hours for parents and day-scholar guests?', tags: ['Hostel', 'Visitors'] },
    { title: 'How to submit a room maintenance or AC repair ticket?', tags: ['Hostel', 'Maintenance'] },
    { title: 'What is the disciplinary action for unauthorized room occupancy?', tags: ['Hostel', 'Conduct'] },
  ],
  placements: [
    { title: 'What qualifies as a dream company offer during campus drives?', tags: ['Placements', 'Dream'] },
    { title: 'What is the minimum CGPA eligibility for top-tier software hiring?', tags: ['Placements', 'Eligibility'] },
    { title: 'Can a student reject an accepted on-campus placement offer?', tags: ['Placements', 'Offers'] },
    { title: 'What are the internship credit conversion guidelines?', tags: ['Placements', 'Internships'] },
    { title: 'What is the policy on pre-placement offers (PPO) from summer internships?', tags: ['Placements', 'PPO'] },
    { title: 'What are the rules regarding dress code and attendance in drives?', tags: ['Placements', 'Drives'] },
  ]
};

export default function ChatIndexPage() {
  const router = useRouter();
  const { 
    threads, 
    activeThread, 
    selectedDepartment, 
    createThread, 
    sendMessageStream, 
    fetchThreads 
  } = useChatStore();

  const isExplicitNewChat = router.query.new === 'true';

  // Automatically activate the latest chat by default unless explicitly creating a new chat
  React.useEffect(() => {
    if (!isExplicitNewChat) {
      if (activeThread && (activeThread._id || activeThread.id)) {
        router.replace(`/chat/${activeThread._id || activeThread.id}`);
      } else if (threads && threads.length > 0) {
        const latest = threads[0];
        router.replace(`/chat/${latest._id || latest.id}`);
      } else {
        fetchThreads().then(() => {
          const latestThreads = useChatStore.getState().threads;
          if (latestThreads && latestThreads.length > 0) {
            router.replace(`/chat/${latestThreads[0]._id || latestThreads[0].id}`);
          }
        });
      }
    }
  }, [isExplicitNewChat, activeThread, threads, fetchThreads, router]);

  const activeDomain = selectedDepartment || 'all';
  const currentCards = EXPLORATION_CARDS[activeDomain] || EXPLORATION_CARDS.all;

  const handleCardClick = async (promptTitle) => {
    try {
      const newThread = await createThread(promptTitle, activeDomain);
      const threadId = newThread._id || newThread.id;
      router.push(`/chat/${threadId}`);
      // Stream question in background
      setTimeout(() => {
        sendMessageStream(promptTitle);
      }, 100);
    } catch (e) {
      console.error('Failed to trigger card query:', e);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell showSidebar={true}>
        <div className="relative flex-1 flex flex-col justify-between h-full max-w-6xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
          
          {/* Multi-Layered Ambient Studio Aurora Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#10B981]/20 via-[#10B981]/8 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-[#6366F1]/10 rounded-full blur-[130px] pointer-events-none -z-10" />

          {/* Top Segmented Department Selector */}
          <div className="shrink-0 mb-4">
            <DepartmentSelector />
          </div>

          {/* Center 2x3 Bento Grid of Prompt Cards (Matching Reference Image) */}
          <div className="my-auto py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {currentCards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCardClick(card.title)}
                  className="group relative flex flex-col justify-between h-40 sm:h-44 p-5 rounded-2xl bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#1F2937] hover:border-[#059669] dark:hover:border-[#10B981]/60 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all duration-200 cursor-pointer text-left"
                >
                  {/* Top Question Title */}
                  <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F9FAFB] leading-snug group-hover:text-[#059669] dark:group-hover:text-[#10B981] transition line-clamp-3">
                    {card.title}
                  </h3>

                  {/* Bottom Tags & Action Arrow */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]/60 dark:border-[#1F2937]/80">
                    <div className="flex items-center space-x-1.5 overflow-hidden">
                      {card.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#1F2937]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="w-6 h-6 rounded-full bg-[#ECFDF5] dark:bg-[#0F172A] group-hover:bg-[#059669] dark:group-hover:bg-[#10B981] text-[#059669] dark:text-[#10B981] group-hover:text-white dark:group-hover:text-[#090D16] flex items-center justify-center transition-all shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Floating Query Prompt Bar */}
          <div className="shrink-0 pt-4 pb-2">
            <ChatInput />
          </div>

        </div>

        <CitationDrawer />
      </AppShell>
    </ProtectedRoute>
  );
}
