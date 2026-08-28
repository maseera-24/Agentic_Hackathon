import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  Sparkles,
  UserCheck,
  HelpCircle,
  ArrowRight,
  Check,
  Sliders,
  Award,
  Code,
  BookOpen,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MatchingView() {
  const { students, activeDriveId, drives, openWhyModal, setActiveView, addToast } = usePlacement();
  const [selectedCandidates, setSelectedCandidates] = useState(['STU001', 'STU002', 'STU004', 'STU006', 'STU007']);

  const activeDrive = drives.find(d => d.id === activeDriveId) || drives[0];

  // Candidates who passed eligibility
  const matchedStudents = students.slice(0, 15).map((s, idx) => {
    const techScore = Math.min(98, (s.coding_score || 80) + 4);
    const projScore = (s.projects || []).length >= 2 ? 92 : 78;
    const codingScore = s.coding_score || 85;
    const aptitudeScore = s.aptitude_score || 80;
    const commScore = s.communication_score || 80;

    const overallMatch = Math.round(
      techScore * 0.3 + codingScore * 0.25 + projScore * 0.15 + aptitudeScore * 0.15 + commScore * 0.15
    );

    const explanation = `Strong mastery in ${s.technical_skills.slice(0, 3).join(', ')}, ${s.projects?.length || 2} relevant projects, with top ${codingScore}% coding assessment scores.`;

    return {
      ...s,
      overallMatch,
      breakdown: {
        Technical: techScore,
        Coding: codingScore,
        Projects: projScore,
        Aptitude: aptitudeScore,
        Communication: commScore
      },
      matchExplanation: explanation
    };
  }).sort((a, b) => b.overallMatch - a.overallMatch);

  const toggleSelect = (id) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleApproveShortlist = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    addToast('Shortlist Approved', `TPO approved ${selectedCandidates.length} candidates for interview scheduling.`, 'success');
    setActiveView('schedule');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              Module 3 &middot; Skill-Based Matching
            </span>
            <span className="text-xs text-slate-500">Multidimensional Role-Fit Scoring</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Candidate Role-Fit Matching &amp; Recommendation Engine
          </h2>
          <p className="text-xs text-slate-500">
            Calculates role alignment scores with qualitative reasoning. Human-in-the-loop shortlist approval required.
          </p>
        </div>

        <button
          onClick={handleApproveShortlist}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Approve Shortlist ({selectedCandidates.length}) &amp; Generate Schedule</span>
        </button>
      </div>

      {/* Grid of Matched Candidates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {matchedStudents.map(student => {
          const isSelected = selectedCandidates.includes(student.id);
          const isTopTier = student.overallMatch >= 88;

          return (
            <div
              key={student.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition-all flex flex-col justify-between relative ${
                isSelected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Badge & Match Score */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{student.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{student.id} &middot; {student.branch.split(' ')[0]}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-black tracking-tight ${
                      isTopTier ? 'text-emerald-600' : 'text-indigo-600'
                    }`}>
                      {student.overallMatch}%
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Match Score</span>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-1.5 my-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  {Object.entries(student.breakdown).map(([label, score]) => (
                    <div key={label} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-indigo-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800 w-6 text-right">{score}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Qualitative Explanation */}
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 leading-relaxed font-medium">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    AI Role Fit Analysis
                  </div>
                  {student.matchExplanation}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openWhyModal({
                    title: `Role Fit Breakdown: ${student.name}`,
                    reasons: [
                      `Overall Match: ${student.overallMatch}% calculated across 5 weighted dimensions.`,
                      `Technical Skills: ${student.breakdown.Technical}% (${student.technical_skills.join(', ')})`,
                      `Coding Ability: ${student.breakdown.Coding}% on College Placement Platform.`,
                      `Project Relevance: ${student.breakdown.Projects}% based on ${student.projects?.length || 2} verified repositories.`,
                      `Communication: ${student.breakdown.Communication}% from Mock HR assessment.`
                    ],
                    factors: ['Technical Stack', 'DSA Coding Score', 'Aptitude Benchmarks', 'Project Portfolio', 'Mock Interview Scores'],
                    confidence: 0.96,
                    category: 'Skill-Based Candidate Match',
                    recommendedAction: 'Recommended for Round 1 & Round 2 interview slots.'
                  })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Why?</span>
                </button>

                <button
                  onClick={() => toggleSelect(student.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Shortlisted' : 'Select'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
