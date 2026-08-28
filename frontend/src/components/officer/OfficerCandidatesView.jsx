import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  Users,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Info,
  ChevronRight,
  Award,
  Layers
} from 'lucide-react';

export default function OfficerCandidatesView() {
  const {
    officerStudents,
    drives,
    activeDriveId,
    setActiveDriveId,
    openWhyModal,
    candidatesSubTab,
    setCandidatesSubTab,
    setOfficerTab,
    setDriveWorkflowStep,
    addToast
  } = usePlacement();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [minCgpaFilter, setMinCgpaFilter] = useState('');

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

  // Evaluate candidate logic deterministically
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

    let reasons = [];
    if (!isCgpaOk) reasons.push(`CGPA ${student.cgpa} is below requirement of ${minCgpa}`);
    if (!isBacklogsOk) reasons.push(`${student.backlogs} active backlogs (max allowed: ${maxBacklogs})`);
    if (!isBranchOk) reasons.push(`Branch not eligible`);
    if (isEligible) reasons.push(`Meets all academic thresholds (CGPA ${student.cgpa}, 0 backlogs)`);

    return {
      ...student,
      isEligible,
      isCgpaOk,
      isBacklogsOk,
      isBranchOk,
      matchedSkills,
      missingSkills,
      matchPct,
      isShortlisted,
      reasons,
      recommendation: matchPct >= 80 ? 'Strong Match - Recommended for Shortlist' : (matchPct >= 65 ? 'Moderate Fit - Review Profile' : 'High Skill Deficit')
    };
  });

  // Filter candidates
  const filteredList = evaluatedCandidates.filter(s => {
    const q = searchTerm.toLowerCase().trim();
    const matchesQuery = !q ||
      s.name?.toLowerCase().includes(q) ||
      s.id?.toLowerCase().includes(q) ||
      s.branch?.toLowerCase().includes(q) ||
      s.technical_skills?.some(sk => (typeof sk === 'string' ? sk : '').toLowerCase().includes(q));

    const matchesBranch = selectedBranch === 'All' || s.branch === selectedBranch;
    const matchesCgpa = !minCgpaFilter || (s.cgpa || 0) >= parseFloat(minCgpaFilter);

    if (candidatesSubTab === 'matching') {
      return matchesQuery && matchesBranch && matchesCgpa && s.isEligible;
    }
    if (candidatesSubTab === 'eligibility') {
      return matchesQuery && matchesBranch && matchesCgpa;
    }
    return matchesQuery && matchesBranch && matchesCgpa;
  });

  // Sorted candidates for matching tab
  const displayList = candidatesSubTab === 'matching'
    ? [...filteredList].sort((a, b) => b.matchPct - a.matchPct || b.cgpa - a.cgpa)
    : filteredList;

  const eligibleCount = evaluatedCandidates.filter(c => c.isEligible).length;
  const shortlistedCount = evaluatedCandidates.filter(c => c.isShortlisted).length;
  const ineligibleCount = evaluatedCandidates.length - eligibleCount;

  return (
    <div className="space-y-6 animate-fadeIn pb-10 text-[#F8FAFC]">
      {/* Header & Active Drive Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">Candidates &amp; AI Matching</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/30 text-xs font-semibold">
              {officerStudents.length} Registered
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Student roster, deterministic academic eligibility matrix, and AI skill-based match rankings.
          </p>
        </div>

        {/* Active Drive Selector */}
        <div className="flex items-center gap-2 bg-[#151C32] border border-[#27324A] px-3 py-1.5 rounded-xl">
          <span className="text-xs font-semibold text-[#A78BFA]">Drive Context:</span>
          <select
            value={activeDriveId || ''}
            onChange={(e) => setActiveDriveId(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-[200px] truncate"
          >
            {drives.map(d => (
              <option key={d.id} value={d.id} className="bg-[#151C32] text-white">
                {d.company_name} - {d.role_title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setCandidatesSubTab('matching')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            candidatesSubTab === 'matching'
              ? 'bg-gradient-to-tr from-[#1E1B4B] to-[#151C32] border-[#7C3AED] shadow-purple'
              : 'bg-[#151C32] border-[#27324A] hover:border-[#3E4C6D]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">AI Shortlisted</span>
            <Sparkles className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{shortlistedCount} Candidates</div>
          <div className="text-[11px] text-[#A78BFA] mt-0.5">≥ 65% match fit for {currentDrive.company_name}</div>
        </div>

        <div
          onClick={() => setCandidatesSubTab('eligibility')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            candidatesSubTab === 'eligibility'
              ? 'bg-gradient-to-tr from-[#064E3B] to-[#151C32] border-[#22C55E] shadow-soft'
              : 'bg-[#151C32] border-[#27324A] hover:border-[#3E4C6D]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">Academic Eligible</span>
            <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
          </div>
          <div className="text-2xl font-bold text-[#4ADE80] mt-1.5">{eligibleCount} Candidates</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">CGPA ≥ {reqs.min_cgpa}, 0 backlogs</div>
        </div>

        <div
          onClick={() => setCandidatesSubTab('roster')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            candidatesSubTab === 'roster'
              ? 'bg-gradient-to-tr from-[#1E293B] to-[#151C32] border-[#06B6D4] shadow-soft'
              : 'bg-[#151C32] border-[#27324A] hover:border-[#3E4C6D]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">Total Students Roster</span>
            <Users className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{officerStudents.length} Students</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">Across all branches</div>
        </div>
      </div>

      {/* Sub-Tabs Selector & Search/Filter Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-[#151C32] p-3 rounded-2xl border border-[#27324A]">
        {/* Sub tabs pills */}
        <div className="flex items-center gap-1.5 bg-[#0B1020] p-1 rounded-xl border border-[#27324A]">
          <button
            onClick={() => setCandidatesSubTab('matching')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              candidatesSubTab === 'matching'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-purple'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Skill Ranking</span>
          </button>
          <button
            onClick={() => setCandidatesSubTab('eligibility')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              candidatesSubTab === 'eligibility'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-purple'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Eligibility Matrix</span>
          </button>
          <button
            onClick={() => setCandidatesSubTab('roster')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              candidatesSubTab === 'roster'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-purple'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Full Roster</span>
          </button>
        </div>

        {/* Search & Branch Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, USN, skill..."
              className="w-full bg-[#0B1020] border border-[#27324A] text-xs text-white rounded-xl pl-9 pr-3 py-2 outline-none focus:border-[#7C3AED]"
            />
          </div>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-[#0B1020] border border-[#27324A] text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-[#7C3AED] cursor-pointer"
          >
            <option value="All">All Branches</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Information Technology">IT</option>
            <option value="Artificial Intelligence & Data Science">AI&amp;DS</option>
            <option value="Electronics & Communication Engineering">ECE</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-[#151C32] rounded-2xl border border-[#27324A] overflow-hidden text-xs shadow-soft">
        <table className="w-full text-left">
          <thead className="bg-[#111827] border-b border-[#27324A] text-[#94A3B8] text-[11px] font-medium uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Candidate</th>
              <th className="py-3.5 px-4">Branch &amp; Academics</th>
              {candidatesSubTab === 'matching' && <th className="py-3.5 px-4">Match Score</th>}
              <th className="py-3.5 px-4">Matched Skills</th>
              {candidatesSubTab === 'matching' && <th className="py-3.5 px-4">Missing Skills</th>}
              <th className="py-3.5 px-4">Status &amp; Recommendation</th>
              <th className="py-3.5 px-4 text-right">Reasoning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27324A]">
            {displayList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                  No candidates found matching the selected filters.
                </td>
              </tr>
            ) : (
              displayList.map((candidate, idx) => (
                <tr key={candidate.id} className="hover:bg-[#1B2340] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {candidatesSubTab === 'matching' && (
                        <span className="w-5 h-5 rounded-full bg-[#1E293B] text-[10px] text-[#A78BFA] font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                      )}
                      <span>{candidate.name}</span>
                    </div>
                    <span className="text-[11px] text-[#94A3B8] font-mono">{candidate.id}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-white truncate max-w-[180px]">{candidate.branch}</div>
                    <div className="text-[11px] text-[#94A3B8]">
                      CGPA: <strong className="text-white">{candidate.cgpa}</strong> &middot; Backlogs: {candidate.backlogs || 0}
                    </div>
                  </td>

                  {candidatesSubTab === 'matching' && (
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#0B1020] h-2 rounded-full overflow-hidden border border-[#27324A]">
                          <div
                            className={`h-full rounded-full ${
                              candidate.matchPct >= 80 ? 'bg-[#22C55E]' : (candidate.matchPct >= 65 ? 'bg-[#3B82F6]' : 'bg-[#EF4444]')
                            }`}
                            style={{ width: `${candidate.matchPct}%` }}
                          />
                        </div>
                        <span className="font-bold text-white text-xs">{candidate.matchPct}%</span>
                      </div>
                    </td>
                  )}

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {candidate.matchedSkills?.slice(0, 3).map((sk, skIdx) => (
                        <span key={skIdx} className="px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#4ADE80] text-[10px] font-medium border border-[#22C55E]/30">
                          ✓ {sk}
                        </span>
                      ))}
                      {(candidate.matchedSkills?.length || 0) > 3 && (
                        <span className="text-[10px] text-[#94A3B8]">+{candidate.matchedSkills.length - 3}</span>
                      )}
                    </div>
                  </td>

                  {candidatesSubTab === 'matching' && (
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {candidate.missingSkills?.slice(0, 2).map((sk, skIdx) => (
                          <span key={skIdx} className="px-1.5 py-0.5 rounded bg-[#EF4444]/15 text-[#F87171] text-[10px] font-medium border border-[#EF4444]/30">
                            - {sk}
                          </span>
                        ))}
                        {(candidate.missingSkills?.length || 0) === 0 && (
                          <span className="text-[10px] text-[#4ADE80]">None (Full Match)</span>
                        )}
                      </div>
                    </td>
                  )}

                  <td className="py-3 px-4">
                    {candidate.isEligible ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#4ADE80] font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Eligible
                        </span>
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">{candidate.recommendation}</div>
                      </div>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#F87171] font-semibold text-[10px]">
                          <XCircle className="w-3 h-3" /> Ineligible
                        </span>
                        <div className="text-[10px] text-[#EF4444] mt-0.5 truncate max-w-[140px]" title={candidate.reasons?.join('; ')}>
                          {candidate.reasons?.[0]}
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openWhyModal({
                        title: `AI Match Fit: ${candidate.name}`,
                        entity: candidate,
                        category: candidate.isEligible ? 'Skill Alignment' : 'Academic Threshold',
                        confidence: 0.96,
                        factors: ['CGPA Cutoff', 'Backlog Check', 'Skill Coverage', 'Branch Mapping'],
                        reasons: candidate.reasons || ['Evaluated criteria.'],
                        recommendedAction: candidate.isEligible ? 'Candidate recommended for Technical Assessment' : 'Candidate ineligible for active drive criteria.'
                      })}
                      className="px-2.5 py-1 rounded-lg bg-[#1E293B] hover:bg-[#7C3AED]/20 text-[#A78BFA] border border-[#27324A] hover:border-[#7C3AED] transition-all text-xs font-semibold cursor-pointer"
                    >
                      Explain Fit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Action Footer for Workflow */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#151C32] to-[#1E293B] border border-[#27324A] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-[#CBD5E1]">
          Showing <strong className="text-white">{displayList.length}</strong> candidates for <strong className="text-white">{currentDrive.company_name}</strong>.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              addToast('Shortlist Approved', `Finalized ${shortlistedCount} candidate shortlist for ${currentDrive.company_name}.`, 'success');
              setOfficerTab('interviews');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-bold shadow-purple flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Proceed to Interview Scheduling</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
