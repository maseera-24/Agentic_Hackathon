import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Code, 
  BookOpen, 
  Award, 
  ArrowRight,
  HelpCircle,
  Sliders,
  Check
} from 'lucide-react';

export default function ReadinessView() {
  const { students, selectedStudentId, setSelectedStudentId, openWhyModal, addToast } = usePlacement();
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [completedDays, setCompletedDays] = useState([1]);

  const student = students.find(s => s.id === selectedStudentId) || students[0];

  const breakdown = student?.readiness?.breakdown || {
    Technical: 88,
    DSA: 72,
    Aptitude: 84,
    Communication: 78,
    Resume: 90
  };

  const roleScores = student?.readiness?.roles || {
    "Software Engineer": 86,
    "Data Analyst": 82,
    "Cloud Engineer": 84
  };

  const targetBenchmarks = {
    "Software Engineer": { DSA: 88, Technical: 90, Aptitude: 80, Communication: 75, Resume: 85 },
    "Data Analyst": { DSA: 65, Technical: 85, Aptitude: 92, Communication: 82, Resume: 85 },
    "Cloud Engineer": { DSA: 70, Technical: 88, Aptitude: 80, Communication: 75, Resume: 85 }
  };

  const currentBenchmark = targetBenchmarks[targetRole] || targetBenchmarks["Software Engineer"];

  const skillGaps = Object.entries(currentBenchmark).map(([skill, target]) => {
    const current = breakdown[skill] || 70;
    const gap = Math.max(0, target - current);
    return {
      skill,
      current,
      target,
      gap,
      riskLevel: gap > 15 ? 'High Risk' : gap > 7 ? 'Medium Risk' : 'Healthy'
    };
  }).sort((a, b) => b.gap - a.gap);

  const highestRiskSkill = skillGaps[0]?.skill || 'DSA';

  const actionPlan = [
    { day: 1, title: `Day 1: ${highestRiskSkill} Core Patterns & Arrays`, tasks: ['Sliding window & two-pointer technique (5 LeetCode Mediums)', 'Hashing collision resolutions & Set operations'], duration: '3.5 hrs' },
    { day: 2, title: `Day 2: Graph Traversals & Dynamic Programming`, tasks: ['BFS / DFS Topological sort practical problems', '0/1 Knapsack problem variants & memoization'], duration: '4.0 hrs' },
    { day: 3, title: `Day 3: Low-Level System Design & Database Indexing`, tasks: ['Design distributed cache with LRU eviction', 'B-Tree vs Hash indexing tradeoffs in PostgreSQL'], duration: '3.0 hrs' },
    { day: 4, title: `Day 4: Live Peer Mock Interview (Google Format)`, tasks: ['45-min timed coding simulation on binary trees', 'Code refactoring for production clean architecture'], duration: '2.5 hrs' },
    { day: 5, title: `Day 5: HR STAR Method & Leadership Fitment`, tasks: ['Prepare 4 STAR leadership stories', 'Live elevator pitch recording & feedback'], duration: '2.0 hrs' },
  ];

  const toggleDay = (dayNum) => {
    setCompletedDays(prev => 
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
    );
    addToast('Action Plan Updated', `Day ${dayNum} progress toggled.`, 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
              Module 10 &middot; Talent Readiness
            </span>
            <span className="text-xs text-slate-500">Skill Gap to Personalized Roadmap</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Placement Readiness &amp; Personalized Action Plan Hub
          </h2>
          <p className="text-xs text-slate-500">
            Translates skill gaps into concrete 5-day daily practice actions.
          </p>
        </div>

        {/* Candidate & Target Role Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 outline-none"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.branch.split(' ')[0]})
              </option>
            ))}
          </select>

          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="bg-indigo-50 border border-indigo-200 text-xs font-bold rounded-xl px-3 py-2 text-indigo-700 outline-none"
          >
            <option value="Software Engineer">Target: Software Engineer</option>
            <option value="Data Analyst">Target: Data Analyst</option>
            <option value="Cloud Engineer">Target: Cloud Engineer</option>
          </select>
        </div>
      </div>

      {/* Top Readiness Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main Score */}
        <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Overall Placement Readiness
            </span>
            <div className="text-4xl font-black text-white mt-1">
              {student?.readiness?.overall || 86}%
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              Evaluated for <strong>{targetRole}</strong> recruitment benchmarks.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-700/60 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-slate-300 text-[10px]">Coding</div>
              <div className="font-bold text-emerald-300">{student.coding_score}%</div>
            </div>
            <div>
              <div className="text-slate-300 text-[10px]">Aptitude</div>
              <div className="font-bold text-indigo-200">{student.aptitude_score}%</div>
            </div>
            <div>
              <div className="text-slate-300 text-[10px]">Comm</div>
              <div className="font-bold text-purple-200">{student.communication_score}%</div>
            </div>
          </div>
        </div>

        {/* Skill Gap Analysis Radar Bars */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Skill Gap Relative to {targetRole} Benchmark
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Primary Deficit: {highestRiskSkill}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {skillGaps.map(g => (
              <div key={g.skill} className="space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-700 text-[11px]">
                  <span>{g.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Current: {g.current}% / Target: {g.target}%</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      g.gap > 12 ? 'bg-rose-100 text-rose-800' : g.gap > 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {g.gap === 0 ? 'Optimal' : `-${g.gap}% Gap`}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full ${
                      g.current >= g.target ? 'bg-emerald-500' : g.gap > 12 ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${g.current}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized 5-Day Preparation Action Plan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Personalized 5-Day Preparation Action Plan for {student.name}
            </h3>
            <p className="text-xs text-slate-500">
              Dynamically generated to target candidate's <strong>{highestRiskSkill}</strong> deficit before Google/Microsoft interviews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
              Progress: {completedDays.length}/5 Days Complete ({Math.round((completedDays.length / 5) * 100)}%)
            </span>
          </div>
        </div>

        {/* 5-Day Roadmap Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 pt-2">
          {actionPlan.map((step) => {
            const isDone = completedDays.includes(step.day);

            return (
              <div
                key={step.day}
                onClick={() => toggleDay(step.day)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-sm ring-1 ring-emerald-200'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      Day {step.day}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{step.duration}</span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{step.title}</h4>

                  <ul className="mt-2 space-y-1.5 text-[11px] text-slate-600">
                    {step.tasks.map((task, ti) => (
                      <li key={ti} className="flex items-start gap-1.5 leading-tight">
                        <span className="text-indigo-600 font-bold">&bull;</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${
                    isDone ? 'text-emerald-700' : 'text-slate-500'
                  }`}>
                    {isDone ? 'Completed' : 'Click to Check Off'}
                  </span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    isDone ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                  }`}>
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
