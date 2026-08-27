import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  Calendar, 
  MapPin,
  Layers,
  Building2
} from 'lucide-react';

export default function OfficerSchedulesView() {
  const { drives, panels, rooms, officerApplications } = usePlacement();
  const [selectedDriveId, setSelectedDriveId] = useState('ALL');

  const scheduledApps = officerApplications.filter(a => Boolean(a.interview_details?.date && a.interview_details?.venue));

  const filteredSchedules = selectedDriveId === 'ALL'
    ? scheduledApps
    : scheduledApps.filter(a => a.drive_id === selectedDriveId);

  return (
    <div className="space-y-6 animate-fadeIn pb-8 text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#F8FAFC]">Interview Schedules &amp; Panels ({scheduledApps.length})</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Interview slot allocations, panel assignments, and facility room distributions.
          </p>
        </div>

        <select
          value={selectedDriveId}
          onChange={(e) => setSelectedDriveId(e.target.value)}
          className="bg-[#111827] border border-[#334155] text-xs text-[#F8FAFC] rounded-xl px-3 py-2 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all cursor-pointer"
        >
          <option value="ALL">All Placement Drives</option>
          {drives.map(d => (
            <option key={d.id} value={d.id}>{d.company_name} ({d.role_title})</option>
          ))}
        </select>
      </div>

      {/* Facilities Overview Cards with Purple Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151C32] border border-[#27324A] p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">Active Panels</span>
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center border border-[#7C3AED]/40">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#F8FAFC] mt-2">{panels.length || 8} Panels</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">Assigned evaluators</div>
        </div>

        <div className="bg-[#151C32] border border-[#27324A] p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">Allocated Venues</span>
            <div className="w-8 h-8 rounded-xl bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center border border-[#22D3EE]/30">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#F8FAFC] mt-2">{rooms.length || 6} Rooms</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">Physical interview cabins</div>
        </div>

        <div className="bg-[#151C32] border border-[#27324A] p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">Scheduled Candidates</span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 text-[#4ADE80] flex items-center justify-center border border-[#22C55E]/30">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#4ADE80] mt-2">{scheduledApps.length} Candidates</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">Slots booked</div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-[#151C32] rounded-2xl border border-[#27324A] overflow-hidden text-xs shadow-soft">
        <table className="w-full text-left">
          <thead className="bg-[#111827] border-b border-[#27324A] text-[#94A3B8] text-[11px] font-medium uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Candidate</th>
              <th className="py-3.5 px-4">Drive</th>
              <th className="py-3.5 px-4">Date &amp; Time</th>
              <th className="py-3.5 px-4">Venue</th>
              <th className="py-3.5 px-4">Panel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27324A]">
            {filteredSchedules.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#94A3B8]">
                  No interview slots scheduled for this filter.
                </td>
              </tr>
            ) : (
              filteredSchedules.map(item => (
                <tr key={item.id} className="hover:bg-[#1B2340] transition-colors">
                  <td className="py-4 px-4 font-semibold text-[#F8FAFC]">
                    {item.student_name}
                    <div className="text-[10px] text-[#A78BFA] font-mono font-normal">{item.student_id}</div>
                  </td>
                  <td className="py-4 px-4 text-[#F8FAFC]">
                    {item.company_name}
                    <div className="text-[11px] text-[#94A3B8]">{item.role_title}</div>
                  </td>
                  <td className="py-4 px-4 font-medium text-[#22D3EE] font-mono">
                    {item.interview_details?.date} at {item.interview_details?.time}
                  </td>
                  <td className="py-4 px-4 text-[#CBD5E1]">
                    {item.interview_details?.venue}
                  </td>
                  <td className="py-4 px-4 text-[#94A3B8]">
                    <span className="px-2 py-0.5 rounded-lg bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40 font-semibold">
                      {item.interview_details?.panel_name}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
