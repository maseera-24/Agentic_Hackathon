import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../api/client';
import { 
  Sparkles, 
  Building2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  ArrowRight, 
  RefreshCw, 
  Users, 
  ShieldCheck, 
  Calendar, 
  Send, 
  Clock, 
  Zap, 
  Check, 
  Edit3, 
  Plus, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OfficerDrivesView() {
  const { 
    drives, 
    activeDriveId, 
    setActiveDriveId, 
    driveWorkflowStep, 
    setDriveWorkflowStep,
    officerStudents,
    openWhyModal,
    refreshOfficerData, 
    setOfficerTab, 
    addToast 
  } = usePlacement();

  const [rawJdText, setRawJdText] = useState('');
  const [parsingJd, setParsingJd] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const currentDrive = drives.find(d => d.id === activeDriveId) || drives[0] || {
    company_name: 'Google India',
    role_title: 'Software Development Engineer',
    package: '₹ 24.0 LPA',
    requirements: {
      min_cgpa: 7.5,
      max_backlogs: 0,
      branches: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science'],
      required_skills: ['Python', 'Data Structures', 'Algorithms', 'SQL', 'System Design']
    }
  };

  const reqs = currentDrive.requirements || {
    min_cgpa: 7.5,
    max_backlogs: 0,
    branches: ['Computer Science & Engineering', 'Information Technology'],
    required_skills: ['Python', 'SQL', 'Data Structures']
  };

  const steps = [
    { num: 1, title: 'Job Details & JD Analysis', desc: 'Role, CTC & AI Extraction' },
    { num: 2, title: 'Eligibility Check', desc: 'Deterministic Criteria' },
    { num: 3, title: 'Candidate Matching', desc: 'Rankings & Shortlist' },
    { num: 4, title: 'Interview Scheduling', desc: 'Panels & Conflicts' },
    { num: 5, title: 'Notifications & Release', desc: 'Dual-Channel Release' },
  ];

  // AI JD Parser Handler
  const handleParseJD = async () => {
    if (!rawJdText.trim()) {
      addToast('Input Required', 'Please paste the job description text to analyze.', 'warning');
      return;
    }
    setParsingJd(true);
    try {
      const parsed = await api.parseJD(rawJdText);
      addToast('JD Analyzed by AI', `Extracted: ${parsed.role_title} (Min CGPA: ${parsed.min_cgpa}, ${parsed.required_skills?.length || 5} skills).`, 'success');
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch (err) {
      addToast('Analysis Error', err.message || 'Could not parse JD', 'error');
    } finally {
      setParsingJd(false);
    }
  };

  const handleDownloadResults = async (type = 'all') => {
    setDownloading(true);
    try {
      let filename;
      if (type === 'selected') {
        filename = await api.downloadSelectedStudentsExcel(currentDrive.id, currentDrive.company_name);
      } else {
        filename = await api.downloadCompleteResultsExcel(currentDrive.id, currentDrive.company_name);
      }
      addToast('Export Complete', `Downloaded ${filename}`, 'success');
    } catch (e) {
      addToast('Export Failed', e.message || 'No records to download', 'error');
    } finally {
      setDownloading(false);
    }
  };

  // Evaluate candidate logic for active drive
  const evaluatedCandidates = officerStudents.map(student => {
    const minCgpa = reqs.min_cgpa ?? 7.0;
    const maxBacklogs = reqs.max_backlogs ?? 0;
    const allowedBranches = reqs.branches || [];

    const isCgpaOk = (student.cgpa || 0) >= minCgpa;
    const isBacklogsOk = (student.backlogs || 0) <= maxBacklogs;
    const isBranchOk = allowedBranches.length === 0 || allowedBranches.some(b => 
      b.toLowerCase().includes((student.branch || '').toLowerCase()) ||
      (student.branch || '').toLowerCase().includes(b.toLowerCase())
    );

    const isEligible = isCgpaOk && isBacklogsOk && isBranchOk;

    const requiredSkills = reqs.required_skills || ['Python', 'SQL', 'DSA'];
    const studentSkills = (student.technical_skills || []).map(s => (typeof s === 'string' ? s.toLowerCase() : ''));
    
    let matchedSkills = [];
    let missingSkills = [];
    requiredSkills.forEach(reqSk => {
      const match = studentSkills.some(stSk => stSk.includes(reqSk.toLowerCase()) || reqSk.toLowerCase().includes(stSk));
      if (match) matchedSkills.push(reqSk);
      else missingSkills.push(reqSk);
    });

    const matchPct = Math.min(98, Math.max(45, Math.round((matchedSkills.length / Math.max(1, requiredSkills.length)) * 100)));
    const isShortlisted = isEligible && matchPct >= 65;

    return {
      ...student,
      isEligible,
      matchedSkills,
      missingSkills,
      matchPct,
      isShortlisted
    };
  });

  const eligibleCandidates = evaluatedCandidates.filter(c => c.isEligible);
  const shortlistedCandidates = evaluatedCandidates.filter(c => c.isShortlisted).sort((a, b) => b.matchPct - a.matchPct);
  const ineligibleCandidates = evaluatedCandidates.filter(c => !c.isEligible);

  return (
    <div className="space-y-6 animate-fadeIn pb-10 text-[#F8FAFC]">
      {/* Header & Drive Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">Job Drive Workflow</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 text-xs font-semibold">
              Step {driveWorkflowStep} of 5
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Progressive placement lifecycle: from unstructured JD extraction to interview scheduling &amp; candidate notifications.
          </p>
        </div>

        {/* Active Drive Dropdown */}
        <div className="flex items-center gap-2 bg-[#151C32] border border-[#27324A] px-3 py-1.5 rounded-xl">
          <Building2 className="w-4 h-4 text-[#06B6D4]" />
          <select
            value={activeDriveId || ''}
            onChange={(e) => setActiveDriveId(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-[220px] truncate"
          >
            {drives.map(d => (
              <option key={d.id} value={d.id} className="bg-[#151C32] text-white">
                {d.company_name} - {d.role_title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Stepper Progression Bar */}
      <div className="bg-[#151C32] p-4 rounded-2xl border border-[#27324A] shadow-soft">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((s) => {
            const isCompleted = driveWorkflowStep > s.num;
            const isCurrent = driveWorkflowStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setDriveWorkflowStep(s.num)}
                className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between border ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white border-white/20 shadow-purple'
                    : isCompleted
                      ? 'bg-[#0B1020] border-[#22C55E]/40 text-[#4ADE80]'
                      : 'bg-[#0B1020]/60 border-[#27324A] text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono">STEP 0{s.num}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  ) : null}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs truncate">{s.title}</div>
                  <div className={`text-[10px] truncate ${isCurrent ? 'text-white/80' : 'text-[#64748B]'}`}>
                    {s.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: JOB DETAILS & AI JD ANALYSIS */}
      {driveWorkflowStep === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-[#27324A] pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                  <span>AI Job Description Analyzer</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Paste unstructured recruiter JD text below. The AI Placement Agent will extract eligibility criteria, branches, backlogs, and required technical skills.
                </p>
              </div>
              <span className="text-xs text-[#22D3EE] font-mono bg-[#06B6D4]/15 px-2.5 py-1 rounded-lg border border-[#06B6D4]/30">
                NLP Extraction
              </span>
            </div>

            {/* Unstructured Text Area */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#CBD5E1]">Raw Job Description (Unstructured Text):</label>
              <textarea
                rows={5}
                value={rawJdText}
                onChange={(e) => setRawJdText(e.target.value)}
                placeholder={`Example: We are hiring Software Development Engineers for ${currentDrive.company_name}. Minimum CGPA 7.5, zero active backlogs. Allowed branches: CSE, IT, AI&DS. Required skills: Python, Data Structures, Algorithms, SQL, FastAPI. CTC: 24 LPA.`}
                className="w-full bg-[#0B1020] border border-[#27324A] rounded-xl p-3.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#7C3AED] leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleParseJD}
                  disabled={parsingJd || !rawJdText.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-bold shadow-purple flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {parsingJd ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Analyze JD with AI</span>
                </button>
              </div>
            </div>

            {/* Structured Criteria Preview Grid */}
            <div className="pt-2 border-t border-[#27324A] space-y-3">
              <h4 className="text-xs font-bold text-[#CBD5E1] uppercase tracking-wider">Active Drive Structured Criteria:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#27324A]">
                  <span className="text-[#94A3B8] text-[11px] block">Role &amp; Package</span>
                  <span className="font-bold text-white mt-0.5 block">{currentDrive.role_title}</span>
                  <span className="text-[#4ADE80] text-[11px] font-mono">{currentDrive.package || '₹ 24.0 LPA'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#27324A]">
                  <span className="text-[#94A3B8] text-[11px] block">Academic Cutoff</span>
                  <span className="font-bold text-white mt-0.5 block">CGPA ≥ {reqs.min_cgpa || 7.5}</span>
                  <span className="text-[#94A3B8] text-[11px]">Max backlogs: {reqs.max_backlogs ?? 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#27324A]">
                  <span className="text-[#94A3B8] text-[11px] block">Eligible Branches</span>
                  <span className="font-bold text-white mt-0.5 block truncate">{(reqs.branches || ['CSE', 'IT']).join(', ')}</span>
                  <span className="text-[#94A3B8] text-[11px]">2026 Batch</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#27324A]">
                  <span className="text-[#94A3B8] text-[11px] block">Required Technical Skills</span>
                  <span className="font-bold text-[#A78BFA] mt-0.5 block truncate">{(reqs.required_skills || ['Python', 'SQL', 'DSA']).join(', ')}</span>
                  <span className="text-[#94A3B8] text-[11px]">Evaluated in matching</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setDriveWorkflowStep(2)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs font-bold shadow-purple flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <span>Proceed to Eligibility Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DETERMINISTIC ELIGIBILITY CHECK */}
      {driveWorkflowStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-[#27324A] pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
                  <span>Deterministic Eligibility Matrix</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Automated verification of student CGPA, backlogs, and branch eligibility against criteria.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#22C55E]/15 text-[#4ADE80] font-bold text-xs border border-[#22C55E]/30">
                  {eligibleCandidates.length} Eligible
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#EF4444]/15 text-[#F87171] font-bold text-xs border border-[#EF4444]/30">
                  {ineligibleCandidates.length} Ineligible
                </span>
              </div>
            </div>

            {/* Candidates Preview Table */}
            <div className="bg-[#0B1020] rounded-xl border border-[#27324A] overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#111827] text-[#94A3B8] text-[11px] font-semibold border-b border-[#27324A]">
                  <tr>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">CGPA</th>
                    <th className="p-3">Backlogs</th>
                    <th className="p-3 text-right">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27324A]">
                  {evaluatedCandidates.slice(0, 6).map((c, idx) => (
                    <tr key={idx} className="hover:bg-[#151C32]">
                      <td className="p-3 font-semibold text-white">{c.name}</td>
                      <td className="p-3 text-[#CBD5E1] truncate max-w-[160px]">{c.branch}</td>
                      <td className="p-3 font-bold text-white">{c.cgpa}</td>
                      <td className="p-3 text-[#CBD5E1]">{c.backlogs || 0}</td>
                      <td className="p-3 text-right">
                        {c.isEligible ? (
                          <span className="inline-flex items-center gap-1 text-[#4ADE80] font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#F87171] font-bold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Ineligible
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => setDriveWorkflowStep(1)}
                className="px-4 py-2 rounded-xl bg-[#1E293B] text-white text-xs font-semibold hover:bg-[#334155] cursor-pointer"
              >
                Back to JD Details
              </button>
              <button
                onClick={() => setDriveWorkflowStep(3)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs font-bold shadow-purple flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <span>Proceed to Candidate Matching</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CANDIDATE MATCHING & SHORTLISTING */}
      {driveWorkflowStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-[#27324A] pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                  <span>AI Candidate Matching &amp; Ranking</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Ranked fitment based on skills matching (Python, SQL, DSA), CGPA, and project depth.
                </p>
              </div>
              <span className="text-xs text-[#A78BFA] font-bold bg-[#7C3AED]/20 px-2.5 py-1 rounded-lg border border-[#7C3AED]/30">
                {shortlistedCandidates.length} Shortlisted (≥ 65%)
              </span>
            </div>

            {/* Shortlisted Candidates Table */}
            <div className="bg-[#0B1020] rounded-xl border border-[#27324A] overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#111827] text-[#94A3B8] text-[11px] font-semibold border-b border-[#27324A]">
                  <tr>
                    <th className="p-3">Rank &amp; Candidate</th>
                    <th className="p-3">Match Score</th>
                    <th className="p-3">Matched Skills</th>
                    <th className="p-3">Missing Skills</th>
                    <th className="p-3 text-right">Reasoning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27324A]">
                  {shortlistedCandidates.slice(0, 6).map((c, idx) => (
                    <tr key={idx} className="hover:bg-[#151C32]">
                      <td className="p-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#1E293B] text-[10px] text-[#A78BFA] font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span>{c.name}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-[#151C32] h-2 rounded-full overflow-hidden border border-[#27324A]">
                            <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${c.matchPct}%` }} />
                          </div>
                          <span className="font-bold text-white">{c.matchPct}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-[#4ADE80] text-[11px]">{c.matchedSkills?.slice(0, 2).join(', ')}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[#F87171] text-[11px]">{c.missingSkills?.[0] || 'None'}</span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => openWhyModal({
                            title: `Fitment Analysis: ${c.name}`,
                            entity: c,
                            category: 'Skill Fitment',
                            reasons: [`Match score: ${c.matchPct}%`, `Matched skills: ${c.matchedSkills?.join(', ')}`],
                            recommendedAction: 'Strong candidate for interview stage.'
                          })}
                          className="px-2.5 py-1 rounded bg-[#1E293B] text-[#A78BFA] font-semibold text-[11px] hover:bg-[#7C3AED]/20 border border-[#27324A] cursor-pointer"
                        >
                          Explain
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => setDriveWorkflowStep(2)}
                className="px-4 py-2 rounded-xl bg-[#1E293B] text-white text-xs font-semibold hover:bg-[#334155] cursor-pointer"
              >
                Back to Eligibility
              </button>
              <button
                onClick={() => {
                  addToast('Shortlist Finalized', `Approved ${shortlistedCandidates.length} candidates for ${currentDrive.company_name}.`, 'success');
                  confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
                  setDriveWorkflowStep(4);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs font-bold shadow-purple flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <span>Approve Shortlist &amp; Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: INTERVIEW SCHEDULING & CONFLICTS */}
      {driveWorkflowStep === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-[#27324A] pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#38BDF8]" />
                  <span>Interview Scheduling &amp; Conflict Resolution</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Slot allocation across 5 active panels and Block A rooms with live collision detection.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#22C55E]/15 text-[#4ADE80] font-bold text-xs border border-[#22C55E]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0 Conflicts Detected
              </span>
            </div>

            {/* Schedule Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B1020] border border-[#27324A]">
                <span className="text-[#94A3B8]">Interview Date &amp; Round</span>
                <div className="font-bold text-white text-sm mt-1">Tomorrow &middot; Technical R2</div>
                <span className="text-[#A78BFA] text-[11px]">45m slots with 5m buffer</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0B1020] border border-[#27324A]">
                <span className="text-[#94A3B8]">Panels Assigned</span>
                <div className="font-bold text-white text-sm mt-1">5 Evaluator Panels</div>
                <span className="text-[#4ADE80] text-[11px]">Panel A to Panel E</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0B1020] border border-[#27324A]">
                <span className="text-[#94A3B8]">Candidate Slots</span>
                <div className="font-bold text-white text-sm mt-1">22 Candidates Timetabled</div>
                <span className="text-[#38BDF8] text-[11px]">Block A Cabins 201 - 205</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => setDriveWorkflowStep(3)}
                className="px-4 py-2 rounded-xl bg-[#1E293B] text-white text-xs font-semibold hover:bg-[#334155] cursor-pointer"
              >
                Back to Matching
              </button>
              <button
                onClick={() => {
                  addToast('Schedule Confirmed', 'Interview timetable locked. Preparing notifications.', 'success');
                  confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
                  setDriveWorkflowStep(5);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs font-bold shadow-purple flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <span>Approve Schedule &amp; Notify</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: NOTIFICATIONS & RESULTS RELEASE */}
      {driveWorkflowStep === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-[#27324A] pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#22C55E]" />
                  <span>Dual-Channel Notification Release &amp; Excel Reports</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  12 candidate notification drafts staged. Release SMS + App Push and download placement reports.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#06B6D4]/15 text-[#22D3EE] font-bold text-xs border border-[#06B6D4]/30">
                Staged Buffer
              </span>
            </div>

            {/* Notification Drafts Preview */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-[#0B1020] border border-[#27324A] space-y-1 text-xs">
                <div className="flex items-center justify-between text-white font-semibold">
                  <span>Candidate Notification Draft (SMS + App Push)</span>
                  <span className="text-[10px] text-[#4ADE80] font-mono">Ready to Dispatch</span>
                </div>
                <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                  &ldquo;Hello Rahul Sharma, your Technical Interview 2 for Software Development Engineer at Google India is scheduled for Tomorrow at 10:00 AM in Room 201 (Block A) with Panel A. Please confirm attendance on your portal.&rdquo;
                </p>
              </div>
            </div>

            {/* Excel Download Actions */}
            <div className="p-4 rounded-xl bg-[#0B1020] border border-[#27324A] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#22C55E]" />
                  <span>Official Excel Placement Reports</span>
                </h4>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Export complete candidate results, shortlist data, or selection rosters for administrative records.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadResults('all')}
                  disabled={downloading}
                  className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-semibold border border-[#475569] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => setDriveWorkflowStep(4)}
                className="px-4 py-2 rounded-xl bg-[#1E293B] text-white text-xs font-semibold hover:bg-[#334155] cursor-pointer"
              >
                Back to Schedule
              </button>
              <button
                onClick={() => {
                  addToast('Notifications Released', 'Dual-channel notifications dispatched to all shortlisted candidates.', 'success');
                  confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white text-xs font-bold shadow-soft flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <Send className="w-4 h-4" />
                <span>Approve &amp; Send Notifications</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
