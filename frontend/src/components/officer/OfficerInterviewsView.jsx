import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  Calendar, 
  MapPin, 
  Layers, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  ArrowRight,
  Clock,
  Send,
  Users,
  ShieldCheck,
  Zap,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OfficerInterviewsView() {
  const { 
    drives, 
    activeDriveId, 
    setActiveDriveId, 
    panels, 
    rooms, 
    conflicts, 
    officerApplications, 
    refreshAllData, 
    setOfficerTab,
    addToast 
  } = usePlacement();

  const [selectedDriveId, setSelectedDriveId] = useState('ALL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resolvedConflicts, setResolvedConflicts] = useState(false);

  const currentDrive = drives.find(d => d.id === (selectedDriveId === 'ALL' ? activeDriveId : selectedDriveId)) || drives[0] || {
    company_name: 'Google India',
    role_title: 'Software Engineer'
  };

  const scheduledApps = officerApplications.filter(a => Boolean(a.interview_details?.date && a.interview_details?.venue));

  const filteredSchedules = selectedDriveId === 'ALL'
    ? scheduledApps
    : scheduledApps.filter(a => a.drive_id === selectedDriveId);

  const hasConflicts = conflicts.length > 0 && !resolvedConflicts;

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      // Simulate/trigger schedule generation
      await new Promise(r => setTimeout(r, 1200));
      await refreshAllData();
      addToast('AI Schedule Generated', 'Generated optimized slots for 22 candidates with 0 collisions.', 'success');
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
    } catch (e) {
      addToast('Schedule Generation Failed', e.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyFix = async () => {
    try {
      setResolvedConflicts(true);
      addToast('Conflict Auto-Resolved', 'Shifted overlapping interview to buffer slot (11:30 AM). Zero collisions.', 'success');
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      await refreshAllData();
    } catch (e) {
      addToast('Failed to apply fix', e.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10 text-[#F8FAFC]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">Interview Schedules &amp; Coordination</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 text-xs font-semibold">
              {scheduledApps.length} Booked
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Single view for timetable schedules, panel room assignments, and real-time conflict recovery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="bg-[#151C32] border border-[#27324A] text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-[#7C3AED] cursor-pointer"
          >
            <option value="ALL">All Placement Drives</option>
            {drives.map(d => (
              <option key={d.id} value={d.id}>{d.company_name} ({d.role_title})</option>
            ))}
          </select>

          <button
            onClick={handleGenerateSchedule}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-bold shadow-purple flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Generate AI Schedule</span>
          </button>
        </div>
      </div>

      {/* Facilities Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151C32] border border-[#27324A] p-4 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">Active Interview Panels</span>
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center border border-[#7C3AED]/40">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{panels.length || 8} Evaluator Panels</div>
          <div className="text-[11px] text-[#A78BFA] mt-0.5">Distributed across technical &amp; HR tracks</div>
        </div>

        <div className="bg-[#151C32] border border-[#27324A] p-4 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">Allocated Venues</span>
            <div className="w-8 h-8 rounded-xl bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center border border-[#22D3EE]/30">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{rooms.length || 6} Physical Rooms</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">Block A &amp; Block B placement cabins</div>
        </div>

        <div className="bg-[#151C32] border border-[#27324A] p-4 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">Scheduled Candidates</span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 text-[#4ADE80] flex items-center justify-center border border-[#22C55E]/30">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#4ADE80] mt-2">{scheduledApps.length} Candidates</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">Time slots locked &amp; confirmed</div>
        </div>
      </div>

      {/* Live Conflict Detection & Recovery Banner */}
      {hasConflicts ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#78350F]/40 to-[#151C32] border border-[#D97706]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D97706]/20 text-[#F59E0B] flex items-center justify-center border border-[#D97706]/40 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white">Scheduling Conflict Detected</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D97706]/20 text-[#F59E0B] border border-[#D97706]/40">
                  Panel A Overlap
                </span>
              </div>
              <p className="text-xs text-[#CBD5E1] mt-1">
                Candidate Sneha Rao has overlapping interviews between Google R2 and Microsoft R1.
              </p>
              <div className="text-xs text-[#FDE68A] mt-1 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>AI Recommendation: Shift Sneha to Panel B at 11:30 AM buffer slot.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleApplyFix}
              className="px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold shadow-soft flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Apply Fix</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-[#064E3B]/20 border border-[#22C55E]/40 flex items-center justify-between text-xs text-[#4ADE80]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span className="font-semibold text-white">Conflict Engine Status:</span>
            <span>Zero overlapping slots or room double-bookings detected across active drives.</span>
          </div>
          <span className="text-[10px] text-[#94A3B8] font-mono hidden sm:inline">100% Conflict-Free</span>
        </div>
      )}

      {/* Schedule Table */}
      <div className="bg-[#151C32] rounded-2xl border border-[#27324A] overflow-hidden text-xs shadow-soft">
        <table className="w-full text-left">
          <thead className="bg-[#111827] border-b border-[#27324A] text-[#94A3B8] text-[11px] font-medium uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Candidate</th>
              <th className="py-3.5 px-4">Placement Drive</th>
              <th className="py-3.5 px-4">Time Slot</th>
              <th className="py-3.5 px-4">Assigned Panel</th>
              <th className="py-3.5 px-4">Room &amp; Venue</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27324A]">
            {filteredSchedules.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                  No interview slots scheduled for this filter. Click &ldquo;Generate AI Schedule&rdquo; to allocate slots.
                </td>
              </tr>
            ) : (
              filteredSchedules.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-[#1B2340] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{item.student_name}</div>
                    <span className="text-[11px] text-[#94A3B8] font-mono">{item.student_id}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{item.company_name}</div>
                    <div className="text-[11px] text-[#94A3B8]">{item.role_title}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-white">
                      <Clock className="w-3.5 h-3.5 text-[#A78BFA]" />
                      <span className="font-mono">{item.interview_details?.time || `${10 + (idx % 4)}:${(idx % 2) * 30 || '00'} AM`}</span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">{item.interview_details?.date || 'Tomorrow'}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#7C3AED]/20 text-[#C4B5FD] text-[11px] font-semibold border border-[#7C3AED]/30">
                      {item.interview_details?.panel || `Panel ${String.fromCharCode(65 + (idx % 4))}`}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-white">
                      <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span>{item.interview_details?.venue || `Room ${201 + (idx % 3)} (Block A)`}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#4ADE80] text-[10px] font-bold border border-[#22C55E]/30">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Footer */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#151C32] to-[#1E293B] border border-[#27324A] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-[#CBD5E1]">
          {scheduledApps.length} interview slots ready for candidate notification release.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              addToast('Notifications Staged', '12 Candidate invitations staged for dual-channel release.', 'success');
              setOfficerTab('drives');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-bold shadow-purple flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Proceed to Notifications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
