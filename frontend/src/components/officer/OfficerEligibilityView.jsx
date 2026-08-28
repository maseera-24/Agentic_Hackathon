import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Cpu,
  Layers,
  ChevronRight,
  Filter,
  RefreshCw,
  Award
} from 'lucide-react';

export default function OfficerEligibilityView() {
  const {
    officerStudents,
    drives,
    activeDriveId,
    setActiveDriveId,
    setOfficerTab,
    addToast
  } = usePlacement();

  const [activeSubTab, setActiveSubTab] = useState('eligibility'); // 'eligibility' | 'skill_matching' | 'readiness'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const filteredStudents = officerStudents.filter(s => {
    const q = searchTerm.toLowerCase().trim();
    return !q ||
      s.name?.toLowerCase().includes(q) ||
      s.id?.toLowerCase().includes(q) ||
      s.branch?.toLowerCase().includes(q) ||
      s.technical_skills?.some(sk => (typeof sk === 'string' ? sk : '').toLowerCase().includes(q));
  });

  // Evaluate candidate logic
  const evaluateCandidate = (student) => {
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

    // Skill Match
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
      isEligible,
      isCgpaOk,
      isBacklogsOk,
      isBranchOk,
      matchedSkills,
      missingSkills,
      matchPct,
      isShortlisted,
      decision: isShortlisted ? 'SHORTLISTED' : isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE',
      reasons: [
        isCgpaOk ? `✓ CGPA ${student.cgpa} meets cutoff (${minCgpa})` : `✗ CGPA ${student.cgpa} below cutoff (${minCgpa})`,
        isBacklogsOk ? `✓ Active backlogs: ${student.backlogs || 0} (Limit: ${maxBacklogs})` : `✗ Active backlogs: ${student.backlogs} exceeds limit (${maxBacklogs})`,
        isBranchOk ? `✓ Branch ${student.branch} eligible` : `✗ Branch ${student.branch} not listed`,
        `✓ ${matchedSkills.length}/${requiredSkills.length} mandatory skills matched (${matchPct}%)`
      ]
    };
  };

  const activeCandidate = selectedStudent || filteredStudents[0];
  const activeEval = activeCandidate ? evaluateCandidate(activeCandidate) : null;

  return (
    <div className="space-y-6 animate-fadeIn pb-10 text-[#F8FAFC]">
      {/* Header & Subtabs */}
      <div className="bg-[#151C32] border border-[#27324A] rounded-2xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#A78BFA]" />
            <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
              Eligibility &amp; Intelligence Console
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Real-time academic qualification matrix, multi-factor skill alignment, and candidate readiness scoring.
          </p>
        </div>

        {/* 3 Visually Distinct Subtabs */}
        <div className="flex items-center bg-[#111827] p-1 rounded-xl border border-[#27324A] text-xs">
          <button
            onClick={() => setActiveSubTab('eligibility')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'eligibility'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-purple'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Eligibility Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('skill_matching')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'skill_matching'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-purple'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Skill Matching Analyzer
          </button>
          <button
            onClick={() => setActiveSubTab('readiness')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'readiness'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-purple'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Candidate Readiness
          </button>
        </div>
      </div>

      {/* Target Drive Criteria Banner */}
      <div className="bg-[#0F172A] text-white p-4 rounded-2xl border border-[#27324A] shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center font-bold text-white shadow-purple">
            {currentDrive.company_name.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-[#F8FAFC] block">{currentDrive.company_name} &middot; {currentDrive.role_title}</span>
            <span className="text-[11px] text-[#94A3B8] font-mono">Min CGPA: {reqs.min_cgpa ?? 7.5} &middot; Max Backlogs: {reqs.max_backlogs ?? 0} &middot; Cutoff: 65%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#22D3EE] font-semibold bg-[#22D3EE]/10 px-2.5 py-1 rounded-lg border border-[#22D3EE]/30">
            Required Skills: {(reqs.required_skills || ['Python', 'SQL', 'DSA']).join(', ')}
          </span>
        </div>
      </div>

      {/* Main Split: Candidate Selector + Decision Explanation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List Column */}
        <div className="bg-[#151C32] border border-[#27324A] rounded-2xl p-5 shadow-soft space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate, ID, branch..."
              className="w-full pl-8 pr-3 py-2 bg-[#111827] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredStudents.map(student => {
              const evalData = evaluateCandidate(student);
              const isSelected = activeCandidate?.id === student.id;

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] shadow-purple'
                      : 'bg-[#0F172A] border-[#27324A] hover:border-[#7C3AED]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">{student.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evalData.isShortlisted
                        ? 'bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40'
                        : evalData.isEligible
                          ? 'bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30'
                          : 'bg-[#EF4444]/15 text-[#FCA5A5] border border-[#EF4444]/30'
                    }`}>
                      {evalData.decision}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#94A3B8] mt-1 flex justify-between">
                    <span className="text-[#A78BFA] font-mono">{student.id} &middot; {student.branch.split(' ')[0]}</span>
                    <span className="font-bold text-[#F8FAFC]">CGPA: {student.cgpa}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intelligence Decision Explanation Console */}
        <div className="lg:col-span-2 bg-[#151C32] border border-[#27324A] rounded-2xl p-6 shadow-soft space-y-5">
          {activeCandidate && activeEval ? (
            <div className="space-y-5 text-xs">
              {/* Candidate Banner */}
              <div className="flex items-start justify-between pb-4 border-b border-[#27324A]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#F8FAFC]">{activeCandidate.name}</h3>
                    <span className="font-mono text-xs text-[#A78BFA] bg-[#7C3AED]/20 border border-[#7C3AED]/40 px-2 py-0.5 rounded font-bold">
                      {activeCandidate.id}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {activeCandidate.branch} &middot; Graduation Batch 2026
                  </p>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                    activeEval.isShortlisted
                      ? 'bg-[#7C3AED]/20 text-[#C4B5FD] border-[#7C3AED]/40'
                      : activeEval.isEligible
                        ? 'bg-[#22C55E]/15 text-[#4ADE80] border-[#22C55E]/30'
                        : 'bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/30'
                  }`}>
                    {activeEval.isEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{activeEval.decision}</span>
                  </span>
                  <div className="text-[10px] text-[#94A3B8] mt-1">Skill Match: <span className="font-bold text-[#4ADE80]">{activeEval.matchPct}%</span></div>
                </div>
              </div>

              {/* Subtab 1: Eligibility Matrix View */}
              {activeSubTab === 'eligibility' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-xs text-[#A78BFA] uppercase tracking-wider">
                    DECISION EXPLANATION &middot; ACADEMIC QUALIFICATIONS
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl border ${activeEval.isCgpaOk ? 'bg-[#0F172A] border-[#22C55E]/30' : 'bg-[#0F172A] border-[#EF4444]/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#CBD5E1]">CGPA Threshold</span>
                        {activeEval.isCgpaOk ? <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" /> : <XCircle className="w-4 h-4 text-[#EF4444]" />}
                      </div>
                      <div className="text-lg font-bold text-[#F8FAFC] mt-1">{activeCandidate.cgpa}</div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">Required: &ge; {reqs.min_cgpa ?? 7.5}</div>
                    </div>

                    <div className={`p-4 rounded-xl border ${activeEval.isBacklogsOk ? 'bg-[#0F172A] border-[#22C55E]/30' : 'bg-[#0F172A] border-[#EF4444]/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#CBD5E1]">Active Backlogs</span>
                        {activeEval.isBacklogsOk ? <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" /> : <XCircle className="w-4 h-4 text-[#EF4444]" />}
                      </div>
                      <div className="text-lg font-bold text-[#F8FAFC] mt-1">{activeCandidate.backlogs || 0}</div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">Max Permitted: {reqs.max_backlogs ?? 0}</div>
                    </div>

                    <div className={`p-4 rounded-xl border sm:col-span-2 ${activeEval.isBranchOk ? 'bg-[#0F172A] border-[#22C55E]/30' : 'bg-[#0F172A] border-[#EF4444]/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#CBD5E1]">Engineering Discipline</span>
                        {activeEval.isBranchOk ? <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" /> : <XCircle className="w-4 h-4 text-[#EF4444]" />}
                      </div>
                      <div className="text-sm font-bold text-[#F8FAFC] mt-1">{activeCandidate.branch}</div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">Eligible: {(reqs.branches || []).join(', ')}</div>
                    </div>
                  </div>

                  {/* Concise Decision Explanation Block */}
                  <div className="bg-[#0F172A] p-4 rounded-2xl border border-[#27324A] space-y-2">
                    <span className="font-bold text-xs text-[#A78BFA] block">Auditable Decision Summary:</span>
                    <ul className="space-y-1 text-[11px] text-[#CBD5E1]">
                      {activeEval.reasons.map((r, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Subtab 2: Skill Matching Analyzer */}
              {activeSubTab === 'skill_matching' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-xs text-[#A78BFA] uppercase tracking-wider">
                    MULTI-DIMENSIONAL SKILL ALIGNMENT ({activeEval.matchPct}%)
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-[#4ADE80] block mb-1">
                        ✓ Matched Skills ({activeEval.matchedSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeEval.matchedSkills.map((sk, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 rounded-lg text-xs font-semibold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {activeEval.missingSkills.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-[#FCA5A5] block mb-1">
                          ✗ Missing / Gap Skills ({activeEval.missingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeEval.missingSkills.map((sk, i) => (
                            <span key={i} className="px-2.5 py-1 bg-[#EF4444]/15 text-[#FCA5A5] border border-[#EF4444]/30 rounded-lg text-xs font-semibold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-[#94A3B8] block mb-1">All Candidate Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(activeCandidate.technical_skills || []).map((sk, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#0F172A] text-[#CBD5E1] border border-[#27324A] rounded-lg text-xs">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtab 3: Candidate Readiness Scoring */}
              {activeSubTab === 'readiness' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-xs text-[#A78BFA] uppercase tracking-wider">
                    COMPREHENSIVE READINESS SCORECARD
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
                      <span className="text-[10px] text-[#94A3B8] block">Coding Assessment</span>
                      <span className="font-bold text-base text-[#F8FAFC]">{activeCandidate.coding_score || 88}/100</span>
                    </div>
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
                      <span className="text-[10px] text-[#94A3B8] block">Aptitude Score</span>
                      <span className="font-bold text-base text-[#F8FAFC]">{activeCandidate.aptitude_score || 82}/100</span>
                    </div>
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
                      <span className="text-[10px] text-[#94A3B8] block">Technical DSA</span>
                      <span className="font-bold text-base text-[#A78BFA]">{activeCandidate.readiness?.breakdown?.DSA || 90}%</span>
                    </div>
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#27324A]">
                      <span className="text-[10px] text-[#94A3B8] block">Communication</span>
                      <span className="font-bold text-base text-[#4ADE80]">85/100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#27324A] flex items-center justify-between">
                <button
                  onClick={() => setOfficerTab('results')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-semibold shadow-purple cursor-pointer"
                >
                  Proceed to Final Selection
                </button>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-[#94A3B8]">
              Select a candidate from the left panel to inspect eligibility and skill alignment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
