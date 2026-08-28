import React, { useState, useRef } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../api/client';
import {
  Search,
  Download,
  Upload,
  Eye,
  Plus,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';

export default function OfficerStudentsView() {
  const { officerStudents, refreshOfficerData, addToast } = usePlacement();
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [minCgpa, setMinCgpa] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [addStudentModal, setAddStudentModal] = useState(false);

  // Excel Upload States
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    branch: 'Computer Science & Engineering',
    cgpa: 8.0,
    backlogs: 0,
    graduation_year: 2026,
    placement_status: 'Unplaced'
  });

  const branches = [
    'All',
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication Engineering',
    'Mechanical Engineering'
  ];

  const filteredStudents = officerStudents.filter(s => {
    const matchesBranch = branchFilter === 'All' || s.branch === branchFilter;
    const matchesCgpa = !minCgpa || (s.cgpa || 0) >= parseFloat(minCgpa);
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      s.name?.toLowerCase().includes(q) ||
      s.id?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.technical_skills?.some(sk => (typeof sk === 'string' ? sk : '').toLowerCase().includes(q));
    return matchesBranch && matchesCgpa && matchesSearch;
  });

  const handleOpenDetails = async (student) => {
    setSelectedStudent(student);
    try {
      const details = await api.getOfficerStudentDetails(student.id);
      setStudentDetails(details);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        addToast('Invalid File', 'Please select a Microsoft Excel (.xlsx) file.', 'error');
        return;
      }
      setUploadFile(file);
      setUploadResult(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    try {
      const result = await api.uploadStudentsExcel(uploadFile);
      setUploadResult(result);
      await refreshOfficerData();
      addToast(
        'Upload Complete',
        `Processed ${result.records_processed} rows: ${result.added} added, ${result.updated} updated, ${result.rejected} rejected.`,
        result.rejected > 0 ? 'info' : 'success'
      );
    } catch (err) {
      addToast('Upload Failed', err.message || 'Failed to process Excel spreadsheet.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await api.createStudentByOfficer(newStudent);
      await refreshOfficerData();
      addToast('Candidate Registered', `${newStudent.name} added to student pool.`, 'success');
      setAddStudentModal(false);
      setNewStudent({
        name: '',
        email: '',
        phone: '',
        branch: 'Computer Science & Engineering',
        cgpa: 8.0,
        backlogs: 0,
        graduation_year: 2026,
        placement_status: 'Unplaced'
      });
    } catch (err) {
      addToast('Registration Failed', err.message || 'Failed to add student.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8 text-[#F8FAFC]">
      {/* Header with Excel Upload Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#F8FAFC]">
            Student Candidate Pool ({officerStudents.length})
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Search candidates, ingest bulk rosters via Excel (.xlsx), and inspect academic qualifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.getSampleTemplateUrl()}
            download="Student_Roster_Template.xlsx"
            className="px-3.5 py-2 border border-[#27324A] bg-[#151C32] hover:bg-[#1B2340] text-[#CBD5E1] hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Download Excel Template"
          >
            <Download className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Sample Template</span>
          </a>

          <button
            onClick={() => {
              setUploadFile(null);
              setUploadResult(null);
              setUploadModalOpen(true);
            }}
            className="px-3.5 py-2 bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 text-[#C4B5FD] border border-[#7C3AED]/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Upload Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setAddStudentModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-purple cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#151C32] border border-[#27324A] p-4 rounded-2xl shadow-soft">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate, ID, skills..."
            className="w-full pl-9 pr-3 py-2 bg-[#111827] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          />
        </div>

        <div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          >
            {branches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
            placeholder="Filter min CGPA (e.g. 7.5)..."
            className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#151C32] border border-[#27324A] rounded-2xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#27324A]">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Student ID</th>
                <th className="px-4 py-3.5 font-semibold">Name &amp; Email</th>
                <th className="px-4 py-3.5 font-semibold">Branch</th>
                <th className="px-4 py-3.5 font-semibold">CGPA</th>
                <th className="px-4 py-3.5 font-semibold">Backlogs</th>
                <th className="px-4 py-3.5 font-semibold">Resume Status</th>
                <th className="px-4 py-3.5 font-semibold">Placement Status</th>
                <th className="px-4 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27324A]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-[#94A3B8]">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const isPlaced = (student.placement_status === 'Placed' || student.placement_status === 'SELECTED');
                  const hasResume = Boolean(student.resume_filename || student.resume_url);
                  return (
                    <tr key={student.id} className="hover:bg-[#1B2340] transition-colors">
                      <td className="px-4 py-3.5 font-mono font-medium text-[#A78BFA]">
                        {student.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#F8FAFC]">{student.name}</div>
                        <div className="text-[11px] text-[#94A3B8]">{student.email}</div>
                      </td>
                      <td className="px-4 py-3.5 text-[#CBD5E1] max-w-[160px] truncate">
                        {student.branch}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[#F8FAFC]">
                        {student.cgpa}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          (student.backlogs || 0) === 0 ? 'bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30' : 'bg-[#EF4444]/15 text-[#FCA5A5] border border-[#EF4444]/30'
                        }`}>
                          {student.backlogs || 0} Backlogs
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {hasResume ? (
                          <span className="inline-flex items-center gap-1 text-[#4ADE80] font-semibold text-[11px] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px] bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            <span>Not Uploaded</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isPlaced
                            ? 'bg-[#22C55E]/15 text-[#4ADE80] border-[#22C55E]/30'
                            : 'bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/30'
                        }`}>
                          {student.placement_status || 'Unplaced'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenDetails(student)}
                          className="px-2.5 py-1 rounded-xl border border-[#27324A] hover:border-[#7C3AED] hover:bg-[#1B2340] text-[#A78BFA] font-medium text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Excel Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151C32] w-full max-w-xl rounded-2xl border border-[#27324A] p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27324A]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#A78BFA]" />
                <h3 className="font-semibold text-sm text-[#F8FAFC]">Upload Student Roster (.xlsx)</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#27324A] hover:border-[#7C3AED] bg-[#0F172A] hover:bg-[#1B2340] rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2"
              >
                <Upload className="w-8 h-8 text-[#A78BFA] mx-auto" />
                <div>
                  <span className="font-semibold text-[#F8FAFC] text-xs block">
                    {uploadFile ? uploadFile.name : 'Click to select or drag & drop Excel workbook'}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] block mt-0.5">
                    Supports Microsoft Excel (.xlsx, .xls) files.
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Template Download Prompt */}
              <div className="flex items-center justify-between bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
                <div className="text-[11px] text-[#CBD5E1]">
                  Need the standard format? Download the pre-formatted template.
                </div>
                <a
                  href={api.getSampleTemplateUrl()}
                  download="Student_Roster_Template.xlsx"
                  className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get Template</span>
                </a>
              </div>

              {/* Ingestion Results Summary */}
              {uploadResult && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-[#0F172A] p-2.5 rounded-xl border border-[#27324A]">
                      <span className="text-[10px] text-[#94A3B8] block">Processed</span>
                      <span className="font-bold text-[#F8FAFC]">{uploadResult.records_processed}</span>
                    </div>
                    <div className="bg-[#0F172A] p-2.5 rounded-xl border border-[#27324A]">
                      <span className="text-[10px] text-[#4ADE80] block">Added</span>
                      <span className="font-bold text-[#4ADE80]">+{uploadResult.added}</span>
                    </div>
                    <div className="bg-[#0F172A] p-2.5 rounded-xl border border-[#27324A]">
                      <span className="text-[10px] text-[#A5B4FC] block">Updated</span>
                      <span className="font-bold text-[#A5B4FC]">{uploadResult.updated}</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${uploadResult.rejected > 0 ? 'bg-rose-950/40 border-rose-800' : 'bg-[#0F172A] border-[#27324A]'}`}>
                      <span className={`text-[10px] block ${uploadResult.rejected > 0 ? 'text-rose-300' : 'text-[#94A3B8]'}`}>Rejected</span>
                      <span className={`font-bold ${uploadResult.rejected > 0 ? 'text-rose-400' : 'text-[#F8FAFC]'}`}>{uploadResult.rejected}</span>
                    </div>
                  </div>

                  {/* Rejected Rows Breakdown */}
                  {uploadResult.rejected > 0 && uploadResult.rejected_rows && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Rejected Rows Breakdown:
                      </span>
                      <div className="max-h-36 overflow-y-auto border border-rose-800 rounded-xl bg-rose-950/40 divide-y divide-rose-800 text-[11px]">
                        {uploadResult.rejected_rows.map((rej, idx) => (
                          <div key={idx} className="p-2.5 text-rose-300">
                            <div className="font-semibold">Row {rej.row}: {rej.name} ({rej.student_id})</div>
                            <div className="text-[10px] text-rose-400 opacity-90 mt-0.5">{rej.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-[#27324A] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#27324A] hover:bg-[#1B2340] text-[#CBD5E1] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || uploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold disabled:opacity-50 flex items-center gap-1.5 shadow-purple cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Validating &amp; Ingesting...</span>
                    </>
                  ) : (
                    <span>Process &amp; Ingest Excel</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Single Candidate Modal */}
      {addStudentModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateStudent} className="bg-[#151C32] w-full max-w-lg rounded-2xl border border-[#27324A] p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27324A]">
              <h3 className="font-semibold text-sm text-[#F8FAFC]">Register New Candidate</h3>
              <button type="button" onClick={() => setAddStudentModal(false)} className="p-1 text-[#94A3B8] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="student@apex.edu"
                    required
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="+91 98451 00000"
                    required
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Branch / Discipline</label>
                <select
                  value={newStudent.branch}
                  onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                >
                  {branches.filter(b => b !== 'All').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={newStudent.cgpa}
                    onChange={(e) => setNewStudent({ ...newStudent, cgpa: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newStudent.backlogs}
                    onChange={(e) => setNewStudent({ ...newStudent, backlogs: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={newStudent.graduation_year}
                    onChange={(e) => setNewStudent({ ...newStudent, graduation_year: parseInt(e.target.value) || 2026 })}
                    required
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#27324A] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddStudentModal(false)}
                className="px-4 py-2 rounded-xl border border-[#27324A] hover:bg-[#1B2340] text-[#CBD5E1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold shadow-purple cursor-pointer"
              >
                Register Candidate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151C32] w-full max-w-xl rounded-2xl border border-[#27324A] p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#27324A]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#F8FAFC]">{selectedStudent.name}</h3>
                  <span className="text-[10px] font-mono bg-[#7C3AED]/20 text-[#C4B5FD] px-2 py-0.5 rounded font-semibold border border-[#7C3AED]/40">
                    {selectedStudent.id}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">{selectedStudent.branch} &middot; Class of {selectedStudent.graduation_year || 2026}</p>
              </div>

              <button onClick={() => setSelectedStudent(null)} className="p-1 text-[#94A3B8] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Academic Info */}
            <div className="grid grid-cols-3 gap-2.5 bg-[#0F172A] p-3.5 rounded-xl border border-[#27324A]">
              <div>
                <span className="text-[#94A3B8] text-[10px] block">CGPA</span>
                <span className="font-bold text-[#F8FAFC] text-sm">{selectedStudent.cgpa}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] text-[10px] block">Active Backlogs</span>
                <span className="font-semibold text-[#F8FAFC]">{selectedStudent.backlogs || 0}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] text-[10px] block">10th / 12th %</span>
                <span className="font-semibold text-[#F8FAFC]">{selectedStudent.tenth_percentage || 85}% / {selectedStudent.twelfth_percentage || 85}%</span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block mb-1">Technical Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedStudent.technical_skills || []).map((sk, i) => (
                  <span key={i} className="px-2.5 py-1 bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40 rounded-md text-[11px] font-medium">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] border border-[#27324A]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#A78BFA]" />
                <span className="font-medium text-[#F8FAFC]">
                  {selectedStudent.resume_filename || 'No resume uploaded'}
                </span>
              </div>
              {selectedStudent.resume_filename ? (
                <a
                  href={`/api/students/${selectedStudent.id}/resume`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151C32] border border-[#27324A]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View PDF</span>
                </a>
              ) : (
                <span className="text-[11px] text-amber-400 font-semibold bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-md">
                  Not Uploaded
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-[#27324A] flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl border border-[#27324A] hover:bg-[#1B2340] text-[#CBD5E1] font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
