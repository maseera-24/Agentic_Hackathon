import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  Users,
  Briefcase,
  FileCheck,
  Award,
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
  Bot,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  ChevronRight,
  AlertTriangle,
  Building2,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OfficerDashboardView() {
  const {
    drives,
    officerApplications,
    officerStudents,
    auditLogs,
    conflicts,
    setOfficerTab,
    setDriveWorkflowStep,
    setCandidatesSubTab,
    activeDriveId,
    setActiveDriveId,
    setCopilotOpen,
    sendCopilotMessage,
    addToast
  } = usePlacement();

  const currentDrive = drives.find(d => d.id === activeDriveId) || drives[0] || {
    company_name: 'Google India',
    role_title: 'Software Development Engineer',
    package: '₹ 24.0 LPA'
  };

  const totalStudentsCount = officerStudents.length || 50;
  const eligibleCount = 31;
  const shortlistedCount = 18;
  const scheduledInterviewsCount = 22;

  const attentionItems = [
    {
      id: 'att_1',
      title: '5 Candidates Awaiting Shortlist Approval',
      desc: `High-fit candidates scored ≥ 85% for ${currentDrive.company_name}. Ready for officer confirmation.`,
      severity: 'medium',
      badge: 'Action Required',
      actionLabel: 'Review',
      onClick: () => {
        setOfficerTab('candidates');
        setCandidatesSubTab('matching');
      }
    },
    {
      id: 'att_2',
      title: '1 Evaluator Panel Load Warning',
      desc: 'Panel 2 reached 90% booking capacity. AI auto-rebalance plan ready.',
      severity: 'high',
      badge: 'Panel Bottleneck',
      actionLabel: 'Fix',
      onClick: () => {
        setOfficerTab('interviews');
      }
    },
    {
      id: 'att_3',
      title: '2 Cross-Drive Slot Overlaps',
      desc: 'Simultaneous interview times detected between Google R2 and Microsoft R1.',
      severity: 'high',
      badge: 'Conflict Detected',
      actionLabel: 'Resolve',
      onClick: () => {
        setOfficerTab('interviews');
      }
    },
    {
      id: 'att_4',
      title: '12 Candidate Notifications Staged',
      desc: 'Interview schedule confirmed. Staged dual-channel (SMS + Email) ready for release.',
      severity: 'low',
      badge: 'Staged Buffer',
      actionLabel: 'Approve & Send',
      onClick: () => {
        addToast('Notifications Released', 'Dispatched dual-channel updates to 12 candidates.', 'success');
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      }
    }
  ];

  const recentAiActivities = [
    { time: '10 mins ago', title: 'Schedule Generated & Optimized', desc: `Assigned 22 candidate slots across 5 panels with 0 conflicts`, icon: Calendar, color: 'text-[#4ADE80]' },
    { time: '25 mins ago', title: 'AI Candidate Matching Executed', desc: `Ranked 31 eligible candidates against required Python, DSA, and SQL skills`, icon: Sparkles, color: 'text-[#A78BFA]' },
    { time: '40 mins ago', title: 'Deterministic Eligibility Checked', desc: `Evaluated 50 student records: 31 eligible, 19 ineligible based on CGPA & backlogs`, icon: ShieldCheck, color: 'text-[#22D3EE]' },
    { time: '1 hour ago', title: 'Job Description Analyzed', desc: `Extracted role parameters, CGPA >= 7.5, 0 backlogs, and 5 technical skills`, icon: Bot, color: 'text-[#60A5FA]' },
    { time: '2 hours ago', title: 'Cohort Skill Gaps Calculated', desc: `Identified SQL and Cloud deficits; generated 3-day workshop recommendation`, icon: TrendingUp, color: 'text-[#F59E0B]' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10 text-[#F8FAFC]">

      {/* 1. Compact Operations Header & Active Drive Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151C32] border border-[#27324A] rounded-2xl p-4 sm:p-5 shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Placement Operations Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 text-[10px] font-bold uppercase tracking-wider font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Real-time candidate intelligence, conflict-aware scheduling, and multi-stage placement coordination.
          </p>
        </div>

        {/* Quick Drive Switcher & Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2 bg-[#0B1020] border border-[#27324A] px-3 py-2 rounded-xl text-xs">
            <Building2 className="w-4 h-4 text-[#06B6D4] flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">Focus Drive</span>
              <select
                value={activeDriveId || ''}
                onChange={(e) => setActiveDriveId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-[190px] truncate"
              >
                {drives.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#151C32] text-white">
                    {d.company_name} - {d.role_title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setOfficerTab('drives');
              setDriveWorkflowStep(1);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-bold shadow-purple flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <span>Drive Workflow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setOfficerTab('candidates')}
          className="bg-[#151C32] border border-[#27324A] hover:border-[#7C3AED] p-4 sm:p-5 rounded-2xl shadow-soft cursor-pointer transition-all hover:scale-101"
        >
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{totalStudentsCount}</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">Registered in Roster</div>
        </div>

        <div
          onClick={() => {
            setOfficerTab('candidates');
            setCandidatesSubTab('eligibility');
          }}
          className="bg-[#151C32] border border-[#27324A] hover:border-[#22C55E] p-4 sm:p-5 rounded-2xl shadow-soft cursor-pointer transition-all hover:scale-101"
        >
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-xs font-semibold uppercase tracking-wider">Eligible Candidates</span>
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#4ADE80] mt-2">{eligibleCount}</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">CGPA &amp; Backlogs verified</div>
        </div>

        <div
          onClick={() => {
            setOfficerTab('candidates');
            setCandidatesSubTab('matching');
          }}
          className="bg-[#151C32] border border-[#27324A] hover:border-[#7C3AED] p-4 sm:p-5 rounded-2xl shadow-soft cursor-pointer transition-all hover:scale-101"
        >
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-xs font-semibold uppercase tracking-wider">Shortlisted Fit</span>
            <Sparkles className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#C4B5FD] mt-2">{shortlistedCount}</div>
          <div className="text-[11px] text-[#A78BFA] mt-0.5">≥ 65% AI Skill Match</div>
        </div>

        <div
          onClick={() => setOfficerTab('interviews')}
          className="bg-[#151C32] border border-[#27324A] hover:border-[#38BDF8] p-4 sm:p-5 rounded-2xl shadow-soft cursor-pointer transition-all hover:scale-101"
        >
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-xs font-semibold uppercase tracking-wider">Interviews Scheduled</span>
            <Calendar className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{scheduledInterviewsCount}</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">Slots allocated today</div>
        </div>
      </div>

      {/* 3. Active Placement Drives Live Status Table */}
      <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-5 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#7C3AED]" />
              <span>Active Placement Drives Overview ({drives.length})</span>
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Live recruitment cycles with stages, compensation, and candidate pipelines.
            </p>
          </div>

          <button
            onClick={() => setOfficerTab('drives')}
            className="text-xs text-[#A78BFA] hover:text-white font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Drives</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {drives.slice(0, 3).map(drive => (
            <div
              key={drive.id}
              onClick={() => {
                setActiveDriveId(drive.id);
                setOfficerTab('drives');
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                drive.id === activeDriveId
                  ? 'bg-[#1E1B4B]/70 border-[#7C3AED] shadow-purple'
                  : 'bg-[#0B1020] border-[#27324A] hover:border-[#3E4C6D]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-white">{drive.company_name}</h4>
                  <span className="text-[11px] text-[#22D3EE] font-medium">{drive.role_title}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 font-mono">
                  {drive.package || '₹ 18.0 LPA'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#94A3B8]">
                <div className="flex justify-between text-[11px]">
                  <span>Eligible Min CGPA: <strong className="text-white font-mono">{drive.requirements?.min_cgpa || 7.5}</strong></span>
                  <span className="text-[#A78BFA] font-medium">Round 2 Assessment</span>
                </div>
                <div className="w-full bg-[#111827] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] h-full rounded-full w-[65%]" />
                </div>
              </div>

              <div className="pt-2 border-t border-[#27324A] flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Batch: 2026</span>
                <span className="font-semibold text-[#CBD5E1] flex items-center gap-1 group-hover:text-white">
                  Manage Drive &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Main Split: Actions Requiring Attention (Left) + Recent AI Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Actions Requiring Attention */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
                  <span>Actions Requiring Attention ({attentionItems.length})</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Decisions and operational bottlenecks ready for placement officer action.
                </p>
              </div>
              <span className="text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-1 rounded-lg border border-[#F59E0B]/30">
                Human-in-the-Loop
              </span>
            </div>

            <div className="space-y-3">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[#0B1020] border border-[#27324A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#3E4C6D] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{item.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.severity === 'high'
                          ? 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30'
                          : (item.severity === 'medium'
                            ? 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30'
                            : 'bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/30')
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8]">{item.desc}</p>
                  </div>

                  <button
                    onClick={item.onClick}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-soft flex-shrink-0 ${
                      item.severity === 'high'
                        ? 'bg-[#D97706] hover:bg-[#B45309] text-white'
                        : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                    }`}
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Ask AI Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#151C32] to-[#0B1020] border border-[#7C3AED]/40 flex items-center justify-between gap-3 shadow-purple">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white shadow-purple flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Need something done quickly?</h4>
                <p className="text-[11px] text-[#A78BFA]">Ask the Placement Agent to analyze JDs, match candidates, or check conflicts.</p>
              </div>
            </div>

            <button
              onClick={() => setCopilotOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-soft flex items-center gap-1.5 cursor-pointer transition-all flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Agent</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Recent AI Activity Feed */}
        <div className="space-y-4">
          <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#06B6D4]" />
                <span>Recent AI Operations Activity</span>
              </h3>
              <span className="text-[10px] text-[#4ADE80] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> Live Log
              </span>
            </div>

            <div className="space-y-3.5">
              {recentAiActivities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className={`w-7 h-7 rounded-lg bg-[#0B1020] border border-[#27324A] flex items-center justify-center flex-shrink-0 ${act.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-white truncate">{act.title}</span>
                        <span className="text-[10px] text-[#64748B] font-mono flex-shrink-0">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
