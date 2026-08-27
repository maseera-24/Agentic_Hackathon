import React, { useState, useEffect } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../api/client';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Plus, 
  X,
  Sparkles,
  CheckCircle2,
  Award,
  BookOpen,
  Briefcase
} from 'lucide-react';

export default function StudentProfileView() {
  const { 
    currentUser, 
    studentProfile, 
    myApplications,
    drives,
    refreshStudentData, 
    addToast 
  } = usePlacement();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    college: 'Apex Institute of Technology',
    department: 'School of Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    cgpa: 8.5,
    backlogs: 0,
    tenth_percentage: 88.5,
    twelfth_percentage: 86.0,
    graduation_year: 2026,
    technical_skills: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);

  useEffect(() => {
    if (studentProfile) {
      setFormData({
        name: studentProfile.name || '',
        phone: studentProfile.phone || '',
        college: studentProfile.college || 'Apex Institute of Technology',
        department: studentProfile.department || 'School of Computer Science & Engineering',
        branch: studentProfile.branch || 'Computer Science & Engineering',
        cgpa: studentProfile.cgpa || 8.5,
        backlogs: studentProfile.backlogs ?? 0,
        tenth_percentage: studentProfile.tenth_percentage ?? 88.5,
        twelfth_percentage: studentProfile.twelfth_percentage ?? 86.0,
        graduation_year: studentProfile.graduation_year || 2026,
        technical_skills: studentProfile.technical_skills || ['Python', 'Java', 'SQL', 'Data Structures']
      });
    }
  }, [studentProfile]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (formData.technical_skills.includes(newSkill.trim())) return;
    setFormData(prev => ({
      ...prev,
      technical_skills: [...prev.technical_skills, newSkill.trim()]
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      technical_skills: prev.technical_skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateStudentProfileMe(formData);
      await refreshStudentData();
      addToast('Profile Updated', 'Your academic and personal profile details have been saved.', 'success');
    } catch (err) {
      addToast('Error', err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      addToast('Invalid Format', 'Please upload a valid PDF document.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('File Too Large', 'Maximum resume size is 5MB.', 'error');
      return;
    }

    setUploadingResume(true);
    try {
      await api.uploadStudentResume(file);
      await refreshStudentData();
      addToast('Uploaded', 'Resume PDF uploaded successfully.', 'success');
    } catch (err) {
      addToast('Error', err.message || 'Could not upload resume.', 'error');
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Delete uploaded resume?')) return;
    setDeletingResume(true);
    try {
      await api.deleteStudentResume();
      await refreshStudentData();
      addToast('Removed', 'Resume deleted.', 'info');
    } catch (err) {
      addToast('Error', err.message || 'Failed to delete resume.', 'error');
    } finally {
      setDeletingResume(false);
    }
  };

  const hasResume = Boolean(studentProfile?.resume_filename || studentProfile?.resume_url);

  // Placement Summary Numbers
  const appliedCount = myApplications.length;
  const selectedCount = myApplications.filter(a => a.status === 'SELECTED').length;
  const shortlistedCount = myApplications.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
  const rejectedCount = myApplications.filter(a => a.status === 'NOT_SELECTED').length;
  const eligibleDrivesCount = drives.filter(d => (d.requirements?.min_cgpa ?? 7.0) <= (formData.cgpa || 8.5)).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-8 max-w-4xl text-[#F8FAFC]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#F8FAFC]">Candidate Profile &amp; Academics</h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Manage your verified credentials, academic qualifications, technical skill endorsements, and resume.
        </p>
      </div>

      {/* Placement Summary Card */}
      <div className="bg-[#151C32] p-5 rounded-2xl border border-[#27324A] shadow-soft space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#A78BFA]" />
          <h3 className="font-semibold text-xs text-[#F8FAFC]">My Placement Summary</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
          <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
            <span className="text-[10px] text-[#94A3B8] block">Eligible Drives</span>
            <span className="font-bold text-[#F8FAFC] text-base">{eligibleDrivesCount}</span>
          </div>
          <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
            <span className="text-[10px] text-[#A5B4FC] block">Applied</span>
            <span className="font-bold text-[#A5B4FC] text-base">{appliedCount}</span>
          </div>
          <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
            <span className="text-[10px] text-[#C4B5FD] block">Shortlisted</span>
            <span className="font-bold text-[#C4B5FD] text-base">{shortlistedCount}</span>
          </div>
          <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
            <span className="text-[10px] text-[#4ADE80] block">Selected (Offers)</span>
            <span className="font-bold text-[#4ADE80] text-base">{selectedCount}</span>
          </div>
          <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
            <span className="text-[10px] text-[#FCA5A5] block">Not Selected</span>
            <span className="font-bold text-[#FCA5A5] text-base">{rejectedCount}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="bg-[#151C32] p-6 sm:p-7 rounded-2xl border border-[#27324A] shadow-soft space-y-6 text-xs text-[#F8FAFC]">
        {/* Personal Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[#F8FAFC] pb-2 border-b border-[#27324A]">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98401 00000"
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1">Student ID (Immutable)</label>
              <input
                type="text"
                value={studentProfile?.id || currentUser?.student_id || ''}
                disabled
                className="w-full bg-[#0F172A] border border-[#27324A] rounded-xl px-3 py-2 text-[#64748B] cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1">Institutional Email</label>
              <input
                type="text"
                value={studentProfile?.email || currentUser?.email || ''}
                disabled
                className="w-full bg-[#0F172A] border border-[#27324A] rounded-xl px-3 py-2 text-[#64748B] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="space-y-3 pt-2">
          <h3 className="font-semibold text-[#F8FAFC] pb-2 border-b border-[#27324A]">
            Academic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">College / Institution</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">Branch / Specialization</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence &amp; Data Science</option>
                <option value="Electronics & Communication Engineering">Electronics &amp; Communication Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">Graduation Year</label>
              <input
                type="number"
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) || 2026 })}
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED]"
                required
              />
            </div>

            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">Cumulative CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] font-bold focus:outline-none focus:border-[#7C3AED]"
                required
              />
            </div>

            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.backlogs}
                onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED]"
                required
              />
            </div>

            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">10th Standard Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.tenth_percentage}
                onChange={(e) => setFormData({ ...formData, tenth_percentage: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">12th / Diploma Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.twelfth_percentage}
                onChange={(e) => setFormData({ ...formData, twelfth_percentage: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-3 pt-2">
          <h3 className="font-semibold text-[#F8FAFC] pb-2 border-b border-[#27324A]">
            Technical Skills &amp; Competencies
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {formData.technical_skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40 text-xs font-medium"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-[#A78BFA] hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. PyTorch, React, Docker)..."
              className="flex-1 bg-[#111827] border border-[#334155] rounded-xl px-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED]"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-purple cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Verified Resume Section */}
        <div className="space-y-3 pt-2">
          <h3 className="font-semibold text-[#F8FAFC] pb-2 border-b border-[#27324A]">
            Verified Placement Resume (PDF)
          </h3>

          {hasResume ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F172A] border border-[#27324A]">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#A78BFA]" />
                <div>
                  <div className="font-semibold text-xs text-[#F8FAFC]">
                    {studentProfile?.resume_filename || `${formData.name}_Resume.pdf`}
                  </div>
                  <div className="text-[11px] text-[#4ADE80] flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified &amp; Attached to Applications</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/students/${studentProfile?.id || currentUser?.student_id}/resume`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#151C32] hover:bg-[#1B2340] text-[#A78BFA] border border-[#27324A] rounded-xl text-xs font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View PDF</span>
                </a>

                <button
                  type="button"
                  onClick={handleDeleteResume}
                  disabled={deletingResume}
                  className="p-1.5 text-[#EF4444] hover:bg-rose-950/40 rounded-xl border border-[#27324A] cursor-pointer"
                  title="Remove Resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-[#27324A] hover:border-[#7C3AED] bg-[#0F172A] hover:bg-[#151C32] rounded-2xl p-6 text-center cursor-pointer block transition-colors space-y-2">
              <Upload className="w-7 h-7 text-[#A78BFA] mx-auto" />
              <span className="font-semibold text-xs text-[#F8FAFC] block">
                {uploadingResume ? 'Uploading PDF...' : 'Upload Student Resume (PDF)'}
              </span>
              <span className="text-[11px] text-[#94A3B8] block">Maximum file size: 5MB</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploadingResume}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="pt-4 border-t border-[#27324A] flex justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white rounded-xl font-semibold shadow-purple transition-all cursor-pointer"
          >
            {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
