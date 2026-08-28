import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../api/client';
import {
  Search,
  Eye,
  Download,
  X,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function OfficerApplicationsView() {
  const {
    drives,
    officerApplications,
    refreshOfficerData,
    setOfficerTab,
    addToast
  } = usePlacement();

  const [selectedDriveFilter, setSelectedDriveFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const statuses = ['ALL', 'APPLIED', 'SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED', 'NOT_SELECTED'];

  const filteredApps = officerApplications.filter(app => {
    const matchesDrive = selectedDriveFilter === 'ALL' || app.drive_id === selectedDriveFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || app.status === selectedStatusFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      app.student_name?.toLowerCase().includes(q) ||
      app.student_id?.toLowerCase().includes(q) ||
      app.company_name?.toLowerCase().includes(q) ||
      app.role_title?.toLowerCase().includes(q);
    return matchesDrive && matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      await refreshOfficerData();
      addToast('Status Updated', `Candidate transitioned to ${newStatus}.`, 'success');
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to update status.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SELECTED':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30">Selected</span>;
      case 'SHORTLISTED':
      case 'INTERVIEW':
      case 'ASSESSMENT':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40">{status}</span>;
      case 'NOT_SELECTED':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#EF4444]/15 text-[#FCA5A5] border border-[#EF4444]/30">Not Selected</span>;
      default:
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#F59E0B]/15 text-[#FCD34D] border border-[#F59E0B]/30">Applied</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8 text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#F8FAFC]">Applications Pipeline ({officerApplications.length})</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Review candidate applications and advance hiring stages.
          </p>
        </div>

        <button
          onClick={() => setOfficerTab('results')}
          className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-purple cursor-pointer"
        >
          <span>Results &amp; Decisions Console</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#151C32] border border-[#27324A] p-4 rounded-2xl shadow-soft">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate, ID, company..."
            className="w-full pl-9 pr-3 py-2 bg-[#111827] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          />
        </div>

        <div>
          <select
            value={selectedDriveFilter}
            onChange={(e) => setSelectedDriveFilter(e.target.value)}
            className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          >
            <option value="ALL">All Placement Drives</option>
            {drives.map(d => (
              <option key={d.id} value={d.id}>{d.company_name} ({d.role_title})</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          >
            {statuses.map(st => (
              <option key={st} value={st}>{st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-[#151C32] rounded-2xl border border-[#27324A] overflow-hidden text-xs shadow-soft">
        <table className="w-full text-left">
          <thead className="bg-[#111827] border-b border-[#27324A] text-[#94A3B8] text-[11px] font-medium uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Student Candidate</th>
              <th className="py-3.5 px-4">Drive</th>
              <th className="py-3.5 px-4">Applied</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Stage Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27324A]">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#94A3B8]">
                  No applications match the selected filters.
                </td>
              </tr>
            ) : (
              filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-[#1B2340] transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-semibold text-[#F8FAFC]">{app.student_name}</div>
                    <div className="text-[10px] text-[#A78BFA] font-mono">{app.student_id}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-medium text-[#F8FAFC]">{app.company_name}</div>
                    <div className="text-[#94A3B8] text-[11px]">{app.role_title}</div>
                  </td>

                  <td className="py-4 px-4 text-[#CBD5E1] font-mono">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                  </td>

                  <td className="py-4 px-4">
                    {getStatusBadge(app.status)}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        className="bg-[#111827] border border-[#334155] text-[11px] text-[#F8FAFC] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all font-medium cursor-pointer"
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="SHORTLISTED">Shortlist</option>
                        <option value="ASSESSMENT">Assessment</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="SELECTED">Selected</option>
                        <option value="NOT_SELECTED">Not Selected</option>
                      </select>

                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-1.5 rounded-xl border border-[#27324A] hover:border-[#7C3AED] hover:bg-[#1B2340] text-[#A78BFA] cursor-pointer"
                        title="View Application"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151C32] w-full max-w-md rounded-2xl border border-[#27324A] p-6 space-y-4 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#27324A]">
              <div>
                <h3 className="font-semibold text-base text-[#F8FAFC]">{selectedApp.student_name}</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">{selectedApp.company_name} - {selectedApp.role_title}</p>
              </div>

              <button onClick={() => setSelectedApp(null)} className="p-1 text-[#94A3B8] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#0F172A] p-4 rounded-xl border border-[#27324A] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8]">Status:</span>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8]">Candidate ID:</span>
                <span className="font-mono font-medium text-[#A78BFA]">{selectedApp.student_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8]">Resume:</span>
                <a
                  href={`/api/officer/students/${selectedApp.student_id}/resume`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#A78BFA] hover:text-[#C4B5FD] hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

            {selectedApp.interview_details?.date && (
              <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#27324A] space-y-1 text-[#F8FAFC]">
                <span className="font-semibold text-[#A78BFA] block">Assigned Interview</span>
                <div>{selectedApp.interview_details.date} at {selectedApp.interview_details.time} in {selectedApp.interview_details.venue} ({selectedApp.interview_details.panel_name})</div>
              </div>
            )}

            <div className="pt-2 border-t border-[#27324A] flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setOfficerTab('results');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold shadow-purple cursor-pointer"
              >
                Go to Decision Console &rarr;
              </button>

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
