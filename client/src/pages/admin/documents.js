import React, { useState, useEffect } from 'react';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import DocumentUploadModal from '../../components/DocumentManager/DocumentUploadModal';
import DocumentListTable from '../../components/DocumentManager/DocumentListTable';
import api from '../../services/api';
import { 
  FileText, 
  UploadCloud, 
  RefreshCw, 
  Sparkles,
  Search,
  Filter,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [isDeptFilterOpen, setIsDeptFilterOpen] = useState(false);

  const ALL_DEPTS = [
    { id: 'academics', label: 'Academics' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'examinations', label: 'Exams' },
    { id: 'hostel', label: 'Hostel' },
    { id: 'placements', label: 'Placements' },
    { id: 'general', label: 'General / Affairs' },
  ];

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/documents');
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const toggleDept = (deptId) => {
    setSelectedDepts((prev) => 
      prev.includes(deptId) ? prev.filter(d => d !== deptId) : [...prev, deptId]
    );
  };

  const filteredDocs = documents.filter((doc) => {
    const matchDept = selectedDepts.length === 0 || selectedDepts.includes(doc.department);
    const matchSearch = 
      !searchQuery || 
      (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (doc.fileName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AppShell showSidebar={true}>
        <div className="relative p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Top Ambient Studio Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#10B981]/15 via-[#6366F1]/8 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

          {/* Top Header & Search/Filter Controls Bar (Matching Reference Image) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input Field */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search document content..."
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] placeholder-[#64748B] dark:placeholder-[#9CA3AF] outline-hidden focus:border-[#059669] dark:focus:border-[#10B981] shadow-xs transition"
              />
              <Filter className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#9CA3AF] pointer-events-none" />
            </div>

            {/* Department Multi-Filter Dropdown & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Department Checkboxes Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDeptFilterOpen(!isDeptFilterOpen)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F9FAFB] hover:border-[#10B981] transition shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
                  <span>Departments {selectedDepts.length > 0 ? `(${selectedDepts.length})` : ''}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {isDeptFilterOpen && (
                  <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] shadow-2xl z-30 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#E2E8F0] dark:border-[#1F2937] text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF]">
                      <span>Filter by Department</span>
                      {selectedDepts.length > 0 && (
                        <button
                          onClick={() => setSelectedDepts([])}
                          className="text-[#059669] dark:text-[#10B981] hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {ALL_DEPTS.map((dept) => (
                        <label
                          key={dept.id}
                          className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDepts.includes(dept.id)}
                            onChange={() => toggleDept(dept.id)}
                            className="rounded border-[#1F2937] text-[#10B981] focus:ring-[#10B981]"
                          />
                          <span className="text-[11px] text-[#0F172A] dark:text-[#F9FAFB] font-medium">{dept.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchDocuments}
                className="p-2.5 rounded-xl text-[#64748B] dark:text-[#9CA3AF] bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#0F172A] transition shadow-xs"
                title="Refresh handbooks"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#059669] dark:text-[#10B981]' : ''}`} />
              </button>

              {/* Upload Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white dark:text-[#090D16] bg-[#059669] dark:bg-[#10B981] hover:bg-[#047857] dark:hover:bg-[#059669] shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-98 transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>+ Upload Campus PDF</span>
              </button>

            </div>
          </div>

          {/* Ingested Documents Table */}
          <DocumentListTable
            documents={filteredDocs}
            onRefresh={fetchDocuments}
            isLoading={isLoading}
          />
        </div>

        {/* High-Tech Ingestion Pipeline Modal */}
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={() => {
            setIsUploadModalOpen(false);
            fetchDocuments();
          }}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
