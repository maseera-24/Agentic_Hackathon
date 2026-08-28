import React, { useState, useEffect } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../api/client';
import { 
  Award, 
  Send, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Mail, 
  MessageSquare, 
  FileSpreadsheet, 
  RefreshCw, 
  Eye, 
  ShieldCheck, 
  X,
  Sparkles
} from 'lucide-react';

export default function OfficerResultsView() {
  const { drives, officerApplications, refreshOfficerData, addToast } = usePlacement();
  
  const [selectedDriveId, setSelectedDriveId] = useState(() => {
    return drives[0]?.id || 'DRIVE_GOOGLE_2026';
  });

  const [selectedAppId, setSelectedAppId] = useState('');
  const [decision, setDecision] = useState('SELECTED');

  // Selected outcome fields
  const [offerCtc, setOfferCtc] = useState('');
  const [nextStep, setNextStep] = useState('Offer letter release and onboarding verification');
  
  // Not selected outcome fields
  const [reason, setReason] = useState('Technical interview score below cutoff');
  const [feedback, setFeedback] = useState('Performed well in algorithms but needs deeper mastery in system design and database indexing.');
  const [saving, setSaving] = useState(false);

  // Staged Notifications Modal & Approval
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [stagedData, setStagedData] = useState(null);
  const [loadingStaged, setLoadingStaged] = useState(false);
  const [approvingSend, setApprovingSend] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);

  const handleDownloadSelected = async () => {
    setDownloadingType('selected');
    try {
      const filename = await api.downloadSelectedStudentsExcel(selectedDriveId, currentDrive?.company_name);
      addToast('Download Started', `Saved ${filename}`, 'success');
    } catch (err) {
      addToast('Export Error', err.message || 'Unable to generate Excel file. Please try again.', 'error');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadNotSelected = async () => {
    setDownloadingType('not_selected');
    try {
      const filename = await api.downloadNotSelectedStudentsExcel(selectedDriveId, currentDrive?.company_name);
      addToast('Download Started', `Saved ${filename}`, 'success');
    } catch (err) {
      addToast('Export Error', err.message || 'Unable to generate Excel file. Please try again.', 'error');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadComplete = async () => {
    setDownloadingType('complete');
    try {
      const filename = await api.downloadCompleteResultsExcel(selectedDriveId, currentDrive?.company_name);
      addToast('Download Started', `Saved ${filename}`, 'success');
    } catch (err) {
      addToast('Export Error', err.message || 'Unable to generate Excel file. Please try again.', 'error');
    } finally {
      setDownloadingType(null);
    }
  };

  const currentDrive = drives.find(d => d.id === selectedDriveId) || drives[0];

  const driveApplications = officerApplications.filter(a => 
    !selectedDriveId || a.drive_id === selectedDriveId
  );

  const selectedApp = driveApplications.find(a => a.id === selectedAppId) || driveApplications[0];

  useEffect(() => {
    if (selectedApp) {
      setOfferCtc(selectedApp.package || currentDrive?.package || '₹ 24.0 LPA');
    }
  }, [selectedApp, currentDrive]);

  const reasonsList = [
    'Academic eligibility criteria not met',
    'Assessment score below cutoff',
    'Technical interview score below cutoff',
    'Coding round failed test cases',
    'HR interview outcome / Culture fitment',
    'Position headcount filled',
    'Other specific evaluation feedback'
  ];

  const handleRecordDecision = async (e) => {
    e.preventDefault();
    if (!selectedApp) {
      addToast('Error', 'Please select a candidate.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (decision === 'SELECTED') {
        await api.updateApplicationResult(selectedApp.id, {
          status: 'SELECTED',
          offer_ctc: offerCtc || selectedApp.package || '₹ 24.0 LPA',
          feedback: feedback || 'Selected for full-time offer after clearing all technical and management evaluation rounds.',
          next_step: nextStep || 'Onboarding Formalities'
        });
        addToast('Offer Confirmed', `Selection recorded for ${selectedApp.student_name}.`, 'success');
      } else {
        await api.updateApplicationResult(selectedApp.id, {
          status: 'NOT_SELECTED',
          reason,
          feedback,
          next_step: 'Explore upcoming campus recruitment drives.'
        });
        addToast('Outcome Recorded', `Feedback saved for ${selectedApp.student_name}.`, 'info');
      }

      await refreshOfficerData();
    } catch (err) {
      addToast('Error', err.message || 'Failed to record decision.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenReviewModal = async () => {
    setLoadingStaged(true);
    setReviewModalOpen(true);
    try {
      const data = await api.getStagedNotifications(selectedDriveId);
      setStagedData(data);
    } catch (err) {
      addToast('Error', 'Failed to load staged notifications.', 'error');
    } finally {
      setLoadingStaged(false);
    }
  };

  const handleApproveAndSend = async () => {
    setApprovingSend(true);
    try {
      const res = await api.approveAndSendNotifications({ drive_id: selectedDriveId });
      addToast('Notifications Sent', res.message, 'success');
      setReviewModalOpen(false);
      await refreshOfficerData();
    } catch (err) {
      addToast('Error', err.message || 'Failed to dispatch notifications.', 'error');
    } finally {
      setApprovingSend(false);
    }
  };

  const selectedCount = driveApplications.filter(a => a.status === 'SELECTED').length;
  const notSelectedCount = driveApplications.filter(a => a.status === 'NOT_SELECTED').length;
  const shortlistedCount = driveApplications.filter(a => a.status === 'SHORTLISTED' || a.status === 'APPLIED').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-8 text-[#F8FAFC]">
      {/* Header & Drive Selector */}
      <div className="bg-[#151C32] border border-[#27324A] rounded-2xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#F8FAFC]">
            Final Selection &amp; Placement Outcomes
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Mark candidate selection outcomes, generate Excel reports, and approve dual-channel (SMS + Email) result broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[#94A3B8] font-medium whitespace-nowrap">Recruitment Drive:</label>
          <select
            value={selectedDriveId}
            onChange={(e) => {
              setSelectedDriveId(e.target.value);
              setSelectedAppId('');
            }}
            className="bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#7C3AED] cursor-pointer"
          >
            {drives.map(d => (
              <option key={d.id} value={d.id}>
                {d.company_name} ({d.role_title})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Real Placement Officer Excel Downloads Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151C32] border border-[#22C55E]/30 p-4 rounded-2xl shadow-soft flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-xs text-[#4ADE80] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Selected Candidates</span>
              </div>
              <p className="text-[11px] text-[#CBD5E1] mt-1">
                Download spreadsheet containing all confirmed offers for {currentDrive?.company_name}.
              </p>
            </div>
            <span className="font-bold text-lg text-[#4ADE80] bg-[#22C55E]/15 px-2.5 py-0.5 rounded-lg border border-[#22C55E]/30">
              {selectedCount}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadSelected}
            disabled={downloadingType === 'selected'}
            className="w-full py-2 px-3 rounded-xl bg-[#22C55E]/20 hover:bg-[#22C55E]/30 text-[#4ADE80] border border-[#22C55E]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {downloadingType === 'selected' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Excel...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Selected (.xlsx)</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-[#151C32] border border-[#EF4444]/30 p-4 rounded-2xl shadow-soft flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-xs text-[#FCA5A5] flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>Not Selected Candidates</span>
              </div>
              <p className="text-[11px] text-[#CBD5E1] mt-1">
                Spreadsheet with candidate details, rejection reasons, and constructive feedback.
              </p>
            </div>
            <span className="font-bold text-lg text-[#FCA5A5] bg-[#EF4444]/15 px-2.5 py-0.5 rounded-lg border border-[#EF4444]/30">
              {notSelectedCount}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadNotSelected}
            disabled={downloadingType === 'not_selected'}
            className="w-full py-2 px-3 rounded-xl bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#FCA5A5] border border-[#EF4444]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {downloadingType === 'not_selected' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Excel...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Not Selected (.xlsx)</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-[#151C32] border border-[#7C3AED]/40 p-4 rounded-2xl shadow-soft flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-xs text-[#C4B5FD] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#A78BFA]" />
                <span>Complete Placement Results</span>
              </div>
              <p className="text-[11px] text-[#CBD5E1] mt-1">
                Multi-sheet workbook (Selected, Not Selected, Executive Placement Summary).
              </p>
            </div>
            <span className="font-bold text-lg text-[#A78BFA] bg-[#7C3AED]/20 px-2.5 py-0.5 rounded-lg border border-[#7C3AED]/40">
              {driveApplications.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadComplete}
            disabled={downloadingType === 'complete'}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-purple transition-all disabled:opacity-60 cursor-pointer"
          >
            {downloadingType === 'complete' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Excel...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Full Results (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Communication Approval Checkpoint Banner */}
      <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-5 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center font-bold border border-[#7C3AED]/40">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-xs text-[#F8FAFC] flex items-center gap-2">
              <span>Candidate Communication Checkpoint</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40">
                Dual-Channel: SMS + Email
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Review personalized result dispatches and execute Human-in-the-Loop Officer Approval.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenReviewModal}
          className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-purple cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Review &amp; Approve Notifications</span>
        </button>
      </div>

      {/* Selection Decision Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate List Column */}
        <div className="bg-[#151C32] border border-[#27324A] rounded-2xl p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-[#F8FAFC]">
              Drive Candidates ({driveApplications.length})
            </h3>
            <span className="text-[10px] text-[#94A3B8]">Select candidate to decide</span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {driveApplications.length === 0 ? (
              <div className="p-8 text-center text-[#94A3B8] text-xs">
                No candidates registered for this drive yet.
              </div>
            ) : (
              driveApplications.map(app => {
                const isChosen = (selectedApp?.id === app.id);
                const status = app.status;
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setOfferCtc(app.result_details?.offer_ctc || app.package || currentDrive?.package || '');
                      if (app.result_details?.reason) setReason(app.result_details.reason);
                      if (app.result_details?.feedback) setFeedback(app.result_details.feedback);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                      isChosen
                        ? 'bg-[#7C3AED]/20 border-[#7C3AED] font-semibold shadow-purple'
                        : 'bg-[#0F172A] border-[#27324A] hover:border-[#7C3AED]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F8FAFC]">{app.student_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        status === 'SELECTED'
                          ? 'bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30'
                          : status === 'NOT_SELECTED'
                            ? 'bg-[#EF4444]/15 text-[#FCA5A5] border border-[#EF4444]/30'
                            : 'bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8] mt-1 flex justify-between">
                      <span className="font-mono text-[#A78BFA]">{app.student_id}</span>
                      <span className="font-mono text-[#CBD5E1]">{app.package}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Outcome Decision Form */}
        <div className="lg:col-span-2 bg-[#151C32] border border-[#27324A] rounded-2xl p-6 shadow-soft space-y-4">
          {selectedApp ? (
            <form onSubmit={handleRecordDecision} className="space-y-4 text-xs">
              <div className="flex items-start justify-between pb-3 border-b border-[#27324A]">
                <div>
                  <h3 className="text-base font-semibold text-[#F8FAFC]">{selectedApp.student_name}</h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {selectedApp.student_id} &middot; {selectedApp.company_name} ({selectedApp.role_title})
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#0F172A] p-1 rounded-xl border border-[#27324A]">
                  <button
                    type="button"
                    onClick={() => setDecision('SELECTED')}
                    className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      decision === 'SELECTED'
                        ? 'bg-[#22C55E] text-slate-950 shadow-xs'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    ✓ Mark Selected
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('NOT_SELECTED')}
                    className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      decision === 'NOT_SELECTED'
                        ? 'bg-[#EF4444] text-white shadow-xs'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    ✗ Not Selected
                  </button>
                </div>
              </div>

              {decision === 'SELECTED' ? (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#CBD5E1] font-medium mb-1">Confirmed Offer CTC</label>
                      <input
                        type="text"
                        value={offerCtc}
                        onChange={(e) => setOfferCtc(e.target.value)}
                        placeholder="e.g. ₹ 24.0 LPA"
                        required
                        className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] font-bold text-sm font-mono focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#CBD5E1] font-medium mb-1">Next Onboarding Step</label>
                      <input
                        type="text"
                        value={nextStep}
                        onChange={(e) => setNextStep(e.target.value)}
                        placeholder="HR Document Verification"
                        className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#CBD5E1] font-medium mb-1">Offer Feedback / Performance Note</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Candidate demonstrated exceptional problem-solving and passed all rounds..."
                      className="w-full bg-[#111827] border border-[#334155] rounded-xl p-2.5 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] h-20"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 animate-fadeIn">
                  <div>
                    <label className="block text-[#CBD5E1] font-medium mb-1">Structured Rejection Reason</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED]"
                    >
                      {reasonsList.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#CBD5E1] font-medium mb-1">Detailed Candidate Feedback (Visible on Student Portal)</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Constructive feedback explaining technical areas to strengthen..."
                      className="w-full bg-[#111827] border border-[#334155] rounded-xl p-2.5 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] h-24"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#27324A] flex items-center justify-end gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-5 py-2 rounded-xl text-white font-semibold shadow-md transition-colors cursor-pointer ${
                    decision === 'SELECTED'
                      ? 'bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold'
                      : 'bg-[#EF4444] hover:bg-[#DC2626]'
                  }`}
                >
                  {saving ? 'Saving...' : `Save ${decision === 'SELECTED' ? 'Selection' : 'Rejection'} Outcome`}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-20 text-center text-xs text-[#94A3B8]">
              Select a candidate from the left list to record selection decisions.
            </div>
          )}
        </div>
      </div>

      {/* Review & Approve Notifications Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151C32] w-full max-w-2xl rounded-2xl border border-[#27324A] p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#27324A]">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#A78BFA]" />
                  <h3 className="font-semibold text-base text-[#F8FAFC]">
                    Placement Officer Notification Approval Checkpoint
                  </h3>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Verify messages before final batch dispatch via SMS &amp; Email.
                </p>
              </div>

              <button onClick={() => setReviewModalOpen(false)} className="p-1 text-[#94A3B8] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingStaged ? (
              <div className="py-16 text-center text-[#94A3B8]">
                <RefreshCw className="w-6 h-6 animate-spin text-[#A78BFA] mx-auto mb-2" />
                Loading staged candidate dispatches...
              </div>
            ) : stagedData && stagedData.notifications ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
                    <span className="text-[10px] text-[#94A3B8] block">Total Recipients</span>
                    <span className="text-base font-bold text-[#F8FAFC]">{stagedData.total_staged}</span>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
                    <span className="text-[10px] text-[#4ADE80] block">Selected Alerts</span>
                    <span className="text-base font-bold text-[#4ADE80]">{stagedData.selected_count}</span>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
                    <span className="text-[10px] text-[#FCA5A5] block">Not Selected Alerts</span>
                    <span className="text-base font-bold text-[#FCA5A5]">{stagedData.not_selected_count}</span>
                  </div>
                </div>

                {/* Notification Previews */}
                <div className="space-y-3">
                  <span className="font-semibold text-xs text-[#F8FAFC]">Sample Message Previews</span>
                  {stagedData.notifications.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#0F172A] border border-[#27324A] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#F8FAFC]">{item.student_name} ({item.student_id})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'SELECTED' ? 'bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30' : 'bg-[#EF4444]/15 text-[#FCA5A5] border border-[#EF4444]/30'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {/* SMS Box */}
                      <div className="p-2.5 bg-[#111827] rounded-xl border border-[#27324A] text-[11px] space-y-1">
                        <div className="flex items-center gap-1 text-[#A78BFA] font-semibold text-[10px]">
                          <MessageSquare className="w-3 h-3" />
                          <span>SMS Preview to {item.phone}</span>
                        </div>
                        <p className="whitespace-pre-line text-[#CBD5E1] font-mono text-[10px]">{item.sms_preview}</p>
                      </div>

                      {/* Email Box */}
                      <div className="p-2.5 bg-[#111827] rounded-xl border border-[#27324A] text-[11px] space-y-1">
                        <div className="flex items-center gap-1 text-[#22D3EE] font-semibold text-[10px]">
                          <Mail className="w-3 h-3" />
                          <span>Email: "{item.email_subject}" to {item.email}</span>
                        </div>
                        <p className="whitespace-pre-line text-[#94A3B8] text-[10px] line-clamp-3">{item.email_preview}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#27324A] flex items-center justify-between">
                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#27324A] hover:bg-[#1B2340] text-[#CBD5E1] cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleApproveAndSend}
                    disabled={approvingSend || stagedData.total_staged === 0}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold flex items-center gap-1.5 shadow-purple disabled:opacity-50 cursor-pointer"
                  >
                    {approvingSend ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Approve &amp; Send Notifications</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
