import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  Check, 
  X, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function StudentApplicationsView() {
  const { myApplications, setStudentTab } = usePlacement();
  const [selectedApp, setSelectedApp] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SELECTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30">
            Selected
          </span>
        );
      case 'SHORTLISTED':
      case 'INTERVIEW':
      case 'ASSESSMENT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40">
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        );
      case 'NOT_SELECTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#EF4444]/15 text-[#FCA5A5] border border-[#EF4444]/30">
            Not Selected
          </span>
        );
      case 'APPLIED':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#F59E0B]/15 text-[#FCD34D] border border-[#F59E0B]/30">
            Under Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8 max-w-5xl text-[#F8FAFC]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#F8FAFC]">My Applications ({myApplications.length})</h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Track real-time hiring stage outcomes and scheduled interview details.
        </p>
      </div>

      {/* Applications Table */}
      <div className="bg-[#151C32] rounded-2xl border border-[#27324A] overflow-hidden text-xs shadow-soft">
        {myApplications.length === 0 ? (
          <div className="p-12 text-center text-[#94A3B8]">
            You haven't applied to any placement drives yet.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#111827] border-b border-[#27324A] text-[#94A3B8] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27324A]">
              {myApplications.map(app => (
                <tr
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="hover:bg-[#1B2340] cursor-pointer transition-colors"
                >
                  <td className="py-4 px-4 font-semibold text-[#F8FAFC]">
                    {app.company_name}
                  </td>
                  <td className="py-4 px-4 text-[#CBD5E1]">
                    {app.role_title}
                  </td>
                  <td className="py-4 px-4 text-[#A78BFA] font-mono font-semibold">
                    {app.package}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-[#A78BFA] hover:text-[#C4B5FD] font-semibold inline-flex items-center gap-1 cursor-pointer">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Application Status Details Modal with Dark Command Center Theme */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151C32] w-full max-w-md rounded-2xl border border-[#27324A] p-6 space-y-5 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#27324A]">
              <div>
                <h3 className="text-base font-semibold text-[#F8FAFC]">{selectedApp.company_name}</h3>
                <p className="text-xs text-[#94A3B8]">{selectedApp.role_title} &middot; <span className="text-[#A78BFA] font-mono font-semibold">{selectedApp.package}</span></p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 text-[#94A3B8] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Application Status Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#0F172A] p-3.5 rounded-xl border border-[#27324A]">
                <span className="font-semibold text-[#F8FAFC]">Application Status:</span>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>

              {/* If SELECTED */}
              {selectedApp.status === 'SELECTED' && (
                <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#4ADE80] space-y-3">
                  <div className="font-semibold text-[#4ADE80] flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    <span>Selected for Placement Offer</span>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-[#CBD5E1]">
                    <div><span className="font-semibold text-[#F8FAFC]">Company:</span> {selectedApp.company_name}</div>
                    <div><span className="font-semibold text-[#F8FAFC]">Role:</span> {selectedApp.role_title}</div>
                    <div><span className="font-semibold text-[#F8FAFC]">Drive:</span> {selectedApp.drive_id || 'Campus Placement Drive'}</div>
                    <div><span className="font-semibold text-[#F8FAFC]">Confirmed Package:</span> <span className="font-mono text-[#4ADE80] font-semibold">{selectedApp.result_details?.offer_ctc || selectedApp.package || '₹ 24.0 LPA'}</span></div>
                    <div><span className="font-semibold text-[#F8FAFC]">Selection Date:</span> {appDate(selectedApp.result_details?.updated_at || selectedApp.applied_at)}</div>
                    <div><span className="font-semibold text-[#F8FAFC]">Next Steps:</span> {selectedApp.result_details?.next_step || 'Please visit the Career Services Office to complete offer acceptance and background verification formalities.'}</div>
                  </div>

                  {selectedApp.interview_details?.venue && (
                    <div className="space-y-1 pt-2 border-t border-[#22C55E]/20 text-xs text-[#CBD5E1]">
                      <div><span className="font-semibold text-[#F8FAFC]">Panel:</span> {selectedApp.interview_details.panel_name || 'Panel B'}</div>
                      <div><span className="font-semibold text-[#F8FAFC]">Interview Completed:</span> {selectedApp.interview_details.date} at {selectedApp.interview_details.time}</div>
                      <div><span className="font-semibold text-[#F8FAFC]">Venue:</span> {selectedApp.interview_details.venue}</div>
                    </div>
                  )}
                </div>
              )}

              {/* If NOT SELECTED */}
              {selectedApp.status === 'NOT_SELECTED' && (
                <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#FCA5A5] space-y-3">
                  <div className="font-semibold text-[#FCA5A5] flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                    <span>Not Selected</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#CBD5E1]">
                    <div><span className="font-semibold text-[#F8FAFC]">Company:</span> {selectedApp.company_name}</div>
                    <div><span className="font-semibold text-[#F8FAFC]">Role:</span> {selectedApp.role_title}</div>
                    <div><span className="font-semibold text-[#F8FAFC]">Drive:</span> {selectedApp.drive_id || 'Campus Placement Drive'}</div>
                  </div>

                  <div className="bg-[#0F172A] p-3 rounded-lg border border-[#EF4444]/20 text-[#CBD5E1] space-y-1">
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Reason / Feedback</span>
                    <p className="leading-relaxed text-xs">
                      {selectedApp.result_details?.reason || selectedApp.result_details?.feedback 
                        ? `${selectedApp.result_details.reason ? selectedApp.result_details.reason + '. ' : ''}${selectedApp.result_details.feedback || ''}`
                        : "Detailed feedback is not currently available. Please contact the Placement Office."}
                    </p>
                  </div>
                </div>
              )}

              {/* If in progress with interview assigned */}
              {selectedApp.status !== 'SELECTED' && selectedApp.status !== 'NOT_SELECTED' && selectedApp.interview_details?.date && (
                <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#27324A] space-y-1.5 text-[#CBD5E1]">
                  <span className="font-semibold text-[#F8FAFC] block">Interview Allocation</span>
                  <div><span className="text-[#94A3B8]">Date:</span> {selectedApp.interview_details.date}</div>
                  <div><span className="text-[#94A3B8]">Time:</span> {selectedApp.interview_details.time}</div>
                  <div><span className="text-[#94A3B8]">Venue:</span> {selectedApp.interview_details.venue}</div>
                  <div><span className="text-[#94A3B8]">Panel:</span> {selectedApp.interview_details.panel_name || 'Technical Panel'}</div>
                </div>
              )}

              <div className="text-[11px] text-[#94A3B8] pt-1">
                Applied on: {appDate(selectedApp.applied_at)} &middot; Resume: {selectedApp.resume_filename || 'Resume.pdf'}
              </div>
            </div>

            <div className="pt-2 border-t border-[#27324A] flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
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

function appDate(dt) {
  if (!dt) return 'Recent';
  try {
    return new Date(dt).toLocaleDateString();
  } catch (e) {
    return 'Recent';
  }
}
