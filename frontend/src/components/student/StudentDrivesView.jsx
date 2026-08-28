import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../api/client';
import {
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  Calendar,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function StudentDrivesView() {
  const {
    drives,
    studentProfile,
    myApplications,
    refreshStudentData,
    setStudentTab,
    addToast
  } = usePlacement();

  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [confirmModalDrive, setConfirmModalDrive] = useState(null);
  const [applying, setApplying] = useState(false);

  const filteredDrives = drives.filter(d => {
    const status = (d.drive_status || d.status || '').toUpperCase();
    if (activeTab === 'ACTIVE') return status === 'ACTIVE' || status.includes('PROGRESS') || status.includes('OPEN');
    if (activeTab === 'UPCOMING') return status === 'UPCOMING' || status.includes('ANNOUNCED');
    if (activeTab === 'COMPLETED') return status === 'COMPLETED';
    return true;
  });

  const checkEligibility = (drive) => {
    if (!studentProfile) return { isEligible: true, reasons: [] };
    const reqs = drive.requirements || {};
    const reasons = [];

    if (reqs.min_cgpa !== undefined && (studentProfile.cgpa || 0) < reqs.min_cgpa) {
      reasons.push(`Minimum CGPA required is ${reqs.min_cgpa} (Your CGPA: ${studentProfile.cgpa || 0})`);
    }

    if (reqs.branches && reqs.branches.length > 0 && studentProfile.branch) {
      const branchMatch = reqs.branches.some(b =>
        b.toLowerCase().includes(studentProfile.branch.toLowerCase()) ||
        studentProfile.branch.toLowerCase().includes(b.toLowerCase())
      );
      if (!branchMatch) {
        reasons.push(`Eligible branches: ${reqs.branches.join(', ')}`);
      }
    }

    return {
      isEligible: reasons.length === 0,
      reasons
    };
  };

  const hasApplied = (driveId) => {
    return myApplications.some(a => a.drive_id === driveId);
  };

  const handleApply = async () => {
    if (!confirmModalDrive) return;
    setApplying(true);
    try {
      await api.applyToDrive(confirmModalDrive.id);
      await refreshStudentData();
      addToast('Application Submitted', `Applied to ${confirmModalDrive.company_name} successfully.`, 'success');
      setConfirmModalDrive(null);
      setSelectedDrive(null);
    } catch (err) {
      addToast('Application Failed', err.message || 'Could not submit application.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8 text-[#F8FAFC]">
      {/* Header & Tabs */}
      <div className="bg-[#151C32] p-5 sm:p-6 rounded-2xl border border-[#27324A] shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#F8FAFC]">Placement Drives</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Browse verified campus recruitment drives and verify your eligibility.
          </p>
        </div>

        {/* 3 Visually Distinct Tabs with Dark Theme */}
        <div className="flex items-center bg-[#111827] p-1 rounded-xl border border-[#27324A] text-xs">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold shadow-purple'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            ONGOING
          </button>
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'UPCOMING'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold shadow-purple'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            UPCOMING
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'COMPLETED'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold shadow-purple'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            COMPLETED
          </button>
        </div>
      </div>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <div className="p-12 text-center bg-[#151C32] rounded-2xl border border-[#27324A] shadow-soft text-xs text-[#94A3B8]">
          No {activeTab.toLowerCase()} placement drives found at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredDrives.map(drive => {
            const eligibility = checkEligibility(drive);
            const applied = hasApplied(drive.id);
            const packageVal = drive.package || drive.ctc || 'Industry Standard';
            const deadline = drive.application_deadline || 'Open';
            const branchesText = drive.requirements?.branches?.join(', ') || 'All Branches';

            return (
              <div
                key={drive.id}
                className="bg-[#151C32] rounded-2xl border border-[#27324A] p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-soft hover:border-[#7C3AED] hover:shadow-soft-md transition-all text-xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                        {drive.company_name}
                      </h3>
                      <div className="text-[#94A3B8] text-xs mt-0.5">{drive.role_title}</div>
                    </div>
                    <span className="font-semibold text-[#A78BFA] bg-[#7C3AED]/20 px-2.5 py-1 rounded-lg text-xs font-mono border border-[#7C3AED]/40">
                      {packageVal}
                    </span>
                  </div>

                  <div className="text-[#CBD5E1] text-[11px] space-y-1 pt-1 bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
                    <div className="truncate"><span className="text-[#94A3B8]">Branches:</span> <span className="text-[#F8FAFC] font-medium">{branchesText}</span></div>
                    <div><span className="text-[#94A3B8]">Min CGPA:</span> <span className="text-[#F8FAFC] font-medium">{drive.requirements?.min_cgpa ?? '6.5'}</span></div>
                    <div><span className="text-[#94A3B8]">Deadline:</span> <span className="text-[#F8FAFC] font-medium">{deadline}</span></div>
                  </div>

                  {/* Eligibility Status */}
                  <div className="pt-1">
                    {applied ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4ADE80] bg-[#22C55E]/15 px-2.5 py-1 rounded-md border border-[#22C55E]/30">
                        <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" />
                        Applied
                      </span>
                    ) : eligibility.isEligible ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C4B5FD] bg-[#7C3AED]/20 px-2.5 py-1 rounded-md border border-[#7C3AED]/40">
                        <Check className="w-3 h-3 text-[#A78BFA]" />
                        Eligible to Apply
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FCA5A5] bg-[#EF4444]/15 px-2.5 py-1 rounded-md border border-[#EF4444]/30">
                        <AlertCircle className="w-3 h-3 text-[#EF4444]" />
                        Not Eligible
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#27324A] flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDrive(drive)}
                    className="flex-1 py-2 px-3 rounded-xl border border-[#27324A] hover:border-[#7C3AED] hover:bg-[#1B2340] text-[#CBD5E1] hover:text-white font-medium text-xs text-center transition-colors cursor-pointer"
                  >
                    View Details
                  </button>

                  {activeTab === 'ACTIVE' && (
                    applied ? (
                      <button
                        onClick={() => setStudentTab('applications')}
                        className="py-2 px-3 rounded-xl bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 font-medium text-xs cursor-pointer"
                      >
                        ✓ Applied
                      </button>
                    ) : eligibility.isEligible ? (
                      <button
                        onClick={() => setConfirmModalDrive(drive)}
                        className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-medium text-xs transition-all shadow-purple cursor-pointer"
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        disabled
                        className="py-2 px-3 rounded-xl bg-[#0F172A] text-[#64748B] border border-[#27324A] font-medium text-xs cursor-not-allowed"
                      >
                        Ineligible
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drive Details Modal with Dark Command Center Theme */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151C32] w-full max-w-lg rounded-2xl border border-[#27324A] p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#27324A]">
              <div>
                <h3 className="text-base font-semibold text-[#F8FAFC]">{selectedDrive.company_name}</h3>
                <p className="text-xs text-[#94A3B8]">{selectedDrive.role_title}</p>
              </div>

              <button
                onClick={() => setSelectedDrive(null)}
                className="p-1 text-[#94A3B8] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5 bg-[#0F172A] p-3.5 rounded-xl border border-[#27324A]">
                <div>
                  <span className="text-[#94A3B8] text-[10px] block">Package</span>
                  <span className="font-semibold text-[#A78BFA] font-mono">{selectedDrive.package || selectedDrive.ctc}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[10px] block">Min CGPA</span>
                  <span className="font-semibold text-[#F8FAFC]">{selectedDrive.requirements?.min_cgpa ?? '7.0'}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[10px] block">Deadline</span>
                  <span className="font-semibold text-[#F8FAFC]">{selectedDrive.application_deadline || 'Open'}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[10px] block">Drive Date</span>
                  <span className="font-semibold text-[#F8FAFC]">{selectedDrive.drive_date || 'TBA'}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[10px] block">Location</span>
                  <span className="font-semibold text-[#F8FAFC]">{selectedDrive.location || 'Multiple'}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[10px] block">Eligible Branches</span>
                  <span className="font-semibold text-[#F8FAFC] truncate block">{selectedDrive.requirements?.branches?.join(', ') || 'All'}</span>
                </div>
              </div>

              {selectedDrive.requirements?.required_skills && (
                <div>
                  <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block mb-1">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDrive.requirements.required_skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40 rounded-md text-[11px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDrive.selection_process && (
                <div>
                  <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block mb-1">Selection Process</span>
                  <p className="text-[#CBD5E1] bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
                    {selectedDrive.selection_process}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block mb-1">Description</span>
                <p className="text-[#CBD5E1] leading-relaxed">
                  {selectedDrive.description || 'Enterprise campus recruitment drive.'}
                </p>
              </div>

              {/* Eligibility evaluation */}
              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#27324A]">
                <span className="font-semibold text-[#F8FAFC] block mb-1">Eligibility Status</span>
                {checkEligibility(selectedDrive).isEligible ? (
                  <div className="text-[#4ADE80] font-medium space-y-0.5">
                    <div>✓ CGPA requirement satisfied ({studentProfile?.cgpa || 8.5} &ge; {selectedDrive.requirements?.min_cgpa ?? 7.0})</div>
                    <div>✓ Branch eligible ({studentProfile?.branch})</div>
                  </div>
                ) : (
                  <div className="text-[#FCA5A5] font-medium space-y-0.5">
                    {checkEligibility(selectedDrive).reasons.map((r, i) => (
                      <div key={i}>✗ {r}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-[#27324A] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedDrive(null)}
                className="px-4 py-2 rounded-xl border border-[#27324A] hover:bg-[#1B2340] text-[#CBD5E1] font-medium cursor-pointer"
              >
                Close
              </button>

              {hasApplied(selectedDrive.id) ? (
                <button
                  disabled
                  className="px-5 py-2 rounded-xl bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 font-medium cursor-default"
                >
                  ✓ Applied
                </button>
              ) : checkEligibility(selectedDrive).isEligible ? (
                <button
                  onClick={() => setConfirmModalDrive(selectedDrive)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-medium shadow-purple cursor-pointer"
                >
                  APPLY NOW
                </button>
              ) : (
                <button
                  disabled
                  className="px-5 py-2 rounded-xl bg-[#0F172A] text-[#64748B] border border-[#27324A] font-medium cursor-not-allowed"
                >
                  Not Eligible
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmModalDrive && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151C32] w-full max-w-sm rounded-2xl border border-[#27324A] p-6 space-y-4 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Confirm Application</h3>
              <p className="text-[#94A3B8] mt-0.5">Apply to <span className="font-semibold text-[#F8FAFC]">{confirmModalDrive.company_name}</span> ({confirmModalDrive.role_title})?</p>
            </div>

            <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#27324A] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Attached Resume:</span>
                <span className={`font-medium ${studentProfile?.resume_filename ? 'text-[#4ADE80]' : 'text-amber-400'}`}>
                  {studentProfile?.resume_filename || 'Resume not uploaded'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Package:</span>
                <span className="font-medium text-[#A78BFA] font-mono">{confirmModalDrive.package || confirmModalDrive.ctc}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmModalDrive(null)}
                disabled={applying}
                className="flex-1 py-2 rounded-xl border border-[#27324A] hover:bg-[#1B2340] text-[#CBD5E1] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={applying}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-medium disabled:opacity-50 shadow-purple cursor-pointer"
              >
                {applying ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
