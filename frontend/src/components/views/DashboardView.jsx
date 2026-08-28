import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  Building2,
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  HelpCircle,
  Clock,
  Zap,
  TrendingUp,
  GitFork,
  Check
} from 'lucide-react';

export default function DashboardView() {
  const {
    drives,
    students,
    panels,
    exceptions,
    conflicts,
    auditLogs,
    communications,
    setActiveView,
    openWhyModal,
    triggerVoiceCall,
    runDemoStep,
    addToast
  } = usePlacement();

  const activeDrives = drives.filter(d => d.status.includes('Progress') || d.status.includes('Scheduled') || d.status.includes('Active'));
  const eligibleStudentsCount = 34;
  const shortlistedCount = 22;
  const scheduledToday = 22;
  const unconfirmedCount = students.filter(s => !s.attendance_confirmed).length;
  const unresolvedExceptions = exceptions.filter(e => e.status.includes('Pending') || e.status.includes('Critical'));
  const avgReadiness = 81;

  const handleQuickApproveRecovery = async (excId) => {
    try {
      await fetch(`/api/exceptions/${excId}/approve`, { method: 'POST' });
      runDemoStep(14);
      addToast('Recovery Plan Approved', '18 candidate slots re-routed to Panel 4 & 5. Schedule synchronized.', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Compact Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151C32] border border-[#27324A] rounded-2xl p-4 sm:p-5 shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Campus Placement Operations Command Center
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 text-[10px] font-bold uppercase tracking-wider font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              CYCLE 2026
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Continuously reasoning across live drives, student calendar conflicts, panel workloads, and multi-stage communication escalations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => runDemoStep(10)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-soft transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Panel Failure</span>
          </button>
          <button
            onClick={() => setActiveView('simulator')}
            className="px-3.5 py-2 rounded-xl bg-[#0B1020] hover:bg-[#1E293B] text-white text-xs font-semibold border border-[#27324A] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-300" />
            <span>What-If Simulator</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Active Drives', value: drives.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', view: 'drives' },
          { label: 'Eligible Candidates', value: eligibleStudentsCount, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', view: 'eligibility' },
          { label: 'Shortlisted', value: shortlistedCount, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', view: 'matching' },
          { label: 'Interviews Today', value: scheduledToday, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', view: 'schedule' },
          { label: 'Unconfirmed', value: unconfirmedCount, icon: PhoneCall, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', view: 'communication' },
          { label: 'Active Incidents', value: unresolvedExceptions.length, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', view: 'exceptions' },
          { label: 'Cross Overlaps', value: conflicts.length, icon: GitFork, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', view: 'conflicts' },
          { label: 'Avg Readiness', value: `${avgReadiness}%`, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', view: 'readiness' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => setActiveView(card.view)}
              className={`p-3.5 rounded-2xl bg-white border ${card.border} shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-bold flex items-center">
                  &rarr;
                </span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] font-medium text-slate-500 leading-tight truncate">
                  {card.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical Alert Banner (Human-in-the-Loop Gating for Exception Recovery) */}
      {unresolvedExceptions.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse-slow">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full">
                  Live Operations Exception
                </span>
                <span className="text-xs text-rose-700 font-mono font-bold">18 Candidates Impacted</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-rose-950 mt-0.5">
                {unresolvedExceptions[0]?.title || 'Panel 2 Interviewer Emergency Drop - Reallocation Generated'}
              </h3>
              <p className="text-xs text-rose-800 mt-1 max-w-3xl">
                {unresolvedExceptions[0]?.description || 'Panel 2 became unavailable. Agent formulated Plan A: Divert 10 candidates to Panel 4 and 8 candidates to Panel 5 with zero venue conflicts.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={() => openWhyModal({
                title: 'Panel 2 Re-slotting Reason',
                reasons: [
                  'Panel 2 (Backend Systems) reported illness at 09:45 AM.',
                  'Panel 4 and Panel 5 share identical technical expertise tags (Distributed Systems, Java, C++).',
                  'Panel 4 has 10 open slots; Panel 5 has 8 open slots between 10:30 AM and 1:00 PM.',
                  'Moving all 18 candidates prevents overall drive delay from extending beyond 12 minutes.'
                ],
                factors: ['Panel Specialization', 'Remaining Capacity', 'Candidate Queue Order', 'Room Availability'],
                confidence: 0.98,
                recommendedAction: 'Approve Plan A immediately to dispatch automated push notifications to candidates.'
              })}
              className="px-3 py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200 transition-all flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why?</span>
            </button>

            <button
              onClick={() => handleQuickApproveRecovery(unresolvedExceptions[0]?.id)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Approve Recovery Plan A</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Active Drives & Risk Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Placement Drives Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Active Placement Drives
              </h3>
              <p className="text-xs text-slate-500">Live recruitment pipeline &amp; stage monitoring</p>
            </div>
            <button
              onClick={() => setActiveView('drives')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Company &amp; Role</th>
                  <th className="py-2.5 px-3">Stage / Status</th>
                  <th className="py-2.5 px-3 text-center">Eligible</th>
                  <th className="py-2.5 px-3 text-center">Shortlisted</th>
                  <th className="py-2.5 px-3 text-center">Scheduled</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drives.map(drive => (
                  <tr key={drive.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{drive.company_name}</div>
                      <div className="text-[11px] text-slate-500">{drive.role_title} &middot; {drive.ctc}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        drive.risk_level === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {drive.stage}
                      </span>
                      {drive.risk_level === 'High' && (
                        <div className="text-[10px] text-rose-600 font-medium mt-0.5">⚠️ Panel 2 Incident</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-700">{drive.eligible_count}</td>
                    <td className="py-3 px-3 text-center font-semibold text-indigo-600">{drive.shortlisted_count}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">{drive.scheduled_count}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setActiveView('schedule')}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-[11px] transition-colors"
                      >
                        View Slots
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Proactive Risk Radar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Proactive Risk Center
              </h3>
              <p className="text-xs text-slate-500">Autonomous issue forecasting</p>
            </div>
            <button
              onClick={() => setActiveView('risks')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Matrix
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                level: 'High',
                title: 'Panel 2 Bottleneck at 2:00 PM',
                desc: '18 candidates affected; delay projected +45 mins without intervention.',
                action: 'Recovery Ready',
                btnClass: 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              },
              {
                level: 'High',
                title: 'Unconfirmed Candidate Attendance',
                desc: '12 shortlisted candidates have not confirmed their attendance.',
                action: 'Escalate to Voice',
                btnClass: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              },
              {
                level: 'Medium',
                title: 'Student Cross-Drive Collision',
                desc: '3 candidates scheduled simultaneously for Google & Microsoft rounds.',
                action: 'Auto-Shift Slot',
                btnClass: 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }
            ].map((risk, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    risk.level === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {risk.level} Risk
                  </span>
                  <button
                    onClick={() => {
                      if (risk.action.includes('Voice')) runDemoStep(18);
                      else if (risk.action.includes('Recovery')) runDemoStep(12);
                      else setActiveView('conflicts');
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${risk.btnClass}`}
                  >
                    {risk.action} &rarr;
                  </button>
                </div>
                <div className="text-xs font-bold text-slate-800">{risk.title}</div>
                <div className="text-[11px] text-slate-500 leading-tight">{risk.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Multi-Agent Activity Live Stream & Unconfirmed Candidate Quick Escalation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Agent Audit & Activity Trail */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Live Agent Action &amp; Audit Trail
              </h3>
              <p className="text-xs text-slate-500">Autonomous reasoning, decisions, and human-in-the-loop logs</p>
            </div>
            <button
              onClick={() => setActiveView('audit')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Full Log ({auditLogs.length})
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono border border-indigo-200">
                      {log.approval_level}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">{log.ai_analysis}</div>
                  <div className="text-[11px] text-slate-500">Trigger: {log.trigger} &middot; Status: <span className="font-semibold text-emerald-700">{log.status}</span></div>
                </div>

                <button
                  onClick={() => openWhyModal({
                    title: `Audit Decision: ${log.action}`,
                    reasons: [log.ai_analysis, log.recommendation || 'Operational recommendation applied.'],
                    factors: ['Timestamp', 'Trigger Event', 'Confidence Metric', 'Governance Policy'],
                    confidence: log.confidence || 0.95,
                    recommendedAction: `Human Approver: ${log.human_approval || 'System Auto'}`
                  })}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold flex-shrink-0 flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3 text-indigo-600" />
                  <span>Why?</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Unconfirmed Candidate Rapid Action */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-purple-600" />
                Unconfirmed Attendance
              </h3>
              <p className="text-xs text-slate-500">{unconfirmedCount} candidates pending</p>
            </div>
            <button
              onClick={() => runDemoStep(18)}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              Escalate All
            </button>
          </div>

          <div className="space-y-2.5">
            {students.filter(s => !s.attendance_confirmed).slice(0, 3).map(student => (
              <div key={student.id} className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900">{student.name}</div>
                  <div className="text-[11px] text-slate-500">{student.branch} &middot; {student.phone}</div>
                </div>
                <button
                  onClick={() => triggerVoiceCall(student.id)}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold shadow-sm flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call AI</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
