import React from 'react';
import { useChatStore } from '../../store/chatStore';

const DEPARTMENTS = [
  { id: 'all', label: 'All Departments' },
  { id: 'admissions', label: 'Admissions & Fees' },
  { id: 'academics', label: 'Academics' },
  { id: 'examinations', label: 'Exams' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'placements', label: 'Placements' },
];

export default function DepartmentSelector() {
  const { selectedDepartment, setSelectedDepartment } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center pt-1 pb-3">
      {/* Top Active Pulsing Beacon */}
      <div className="flex items-center space-x-1.5 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
      </div>

      {/* Segmented Pill Container (Matching Reference Image) */}
      <div className="inline-flex items-center p-1 rounded-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] shadow-xs max-w-full overflow-x-auto scrollbar-none">
        {DEPARTMENTS.map((dept) => {
          const isSelected = (selectedDepartment || 'all') === dept.id;

          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartment(dept.id)}
              className={`relative px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-[#ECFDF5] dark:bg-[#0F172A] text-[#059669] dark:text-[#10B981] border border-[#A7F3D0] dark:border-[#10B981]/50 shadow-[0_0_15px_rgba(16,185,129,0.25)] font-bold'
                  : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F9FAFB] border border-transparent'
              }`}
            >
              <span>{dept.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
