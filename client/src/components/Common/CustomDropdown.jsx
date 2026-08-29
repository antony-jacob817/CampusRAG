import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionId) => {
    if (disabled) return;
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1F2937] text-xs font-semibold text-[#0F172A] dark:text-[#F9FAFB] transition duration-150 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-hidden ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#10B981]/50'
        } ${isOpen ? 'border-[#10B981] ring-2 ring-[#10B981]/20' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#64748B] dark:text-[#9CA3AF] transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-[#059669] dark:text-[#10B981]' : ''
          }`}
        />
      </button>

      {/* Floating Menu Popover (Rounded-2xl, Non-Pointy, Glassmorphic) */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#1F2937] shadow-2xl space-y-1 animate-fade-in max-h-60 overflow-y-auto scrollbar-thin">
          {options.map((opt) => {
            const isSelected = opt.id === value;

            return (
              <div
                key={opt.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition duration-150 ${
                  isSelected
                    ? 'bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#10B981] font-bold border border-[#A7F3D0]/60 dark:border-[#065F46]'
                    : 'text-[#0F172A] dark:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#0F172A] hover:text-[#059669] dark:hover:text-[#10B981]'
                }`}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
