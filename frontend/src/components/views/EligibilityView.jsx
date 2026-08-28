import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  Filter,
  Search,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function EligibilityView() {
  const { students, activeDriveId, drives, openWhyModal, setActiveView } = usePlacement();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const activeDrive = drives.find(d => d.id === activeDriveId) || drives[0];

  // Evaluate students against active drive rules (CGPA >= 7.5, Backlogs == 0)
  const evaluatedStudents = students.map(student => {
    const isBranchOk = [
      'Computer Science & Engineering',
      'Information Technology',
      'Artificial Intelligence & Data Science',
      'Electronics & Communication Engineering'
    ].includes(student.branch);

    const isCgpaOk = (student.cgpa || 0) >= 7.5;
    const isBacklogOk = (student.backlogs || 0) === 0;

    let status = 'Eligible';
    let reasons = [];

    if (isBranchOk && isCgpaOk && isBacklogOk) {
      status = 'Eligible';
      reasons.push(`CGPA ${student.cgpa} meets cutoff (>= 7.5).`);
      reasons.push(`0 Active Backlogs satisfies zero-arrear policy.`);
      reasons.push(`Branch '${student.branch}' is mapped to technical eligibility.`);
    } else {
      status = 'Not Eligible';
      if (!isCgpaOk) reasons.push(`CGPA ${student.cgpa} is below requirement of 7.5.`);
      if (!isBacklogOk) reasons.push(`Candidate has ${student.backlogs} active backlogs (0 allowed).`);
      if (!isBranchOk) reasons.push(`Branch '${student.branch}' is outside recruitment scope.`);
    }

    return {
      ...student,
      eligibilityStatus: status,
      reasons
    };
  });

  const filtered = evaluatedStudents.filter(s => {
    const matchesFilter = filterStatus === 'All' || s.eligibilityStatus === filterStatus;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.branch.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const eligibleCount = evaluatedStudents.filter(s => s.eligibilityStatus === 'Eligible').length;
  const notEligibleCount = evaluatedStudents.filter(s => s.eligibilityStatus === 'Not Eligible').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              Module 2 &middot; Policy Verification
            </span>
            <span className="text-xs text-slate-500">Criteria: CGPA &ge; 7.5 &middot; 0 Backlogs</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Student Eligibility Verification Engine
          </h2>
          <p className="text-xs text-slate-500">
            Autonomous rule evaluation for <strong className="text-slate-800">{activeDrive?.company_name} - {activeDrive?.role_title}</strong>.
          </p>
        </div>

        <button
          onClick={() => setActiveView('matching')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
        >
          <span>Proceed to AI Skill Matching</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold">Total Evaluated</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{evaluatedStudents.length}</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700 font-bold">100% Evaluated</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-700 font-semibold">Eligible Candidates</div>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">{eligibleCount}</div>
          </div>
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-700 font-semibold">Not Eligible</div>
            <div className="text-2xl font-black text-rose-900 mt-0.5">{notEligibleCount}</div>
          </div>
          <div className="p-2.5 bg-rose-600 text-white rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, ID, or branch..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {['All', 'Eligible', 'Not Eligible'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Evaluated Candidates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4 text-center">CGPA</th>
                <th className="py-3 px-4 text-center">Backlogs</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Automated Reasoning</th>
                <th className="py-3 px-4 text-right">Explainability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(student => {
                const isEligible = student.eligibilityStatus === 'Eligible';
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{student.id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{student.branch}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{student.cgpa}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{student.backlogs}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {student.eligibilityStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate">
                      {student.reasons[0]}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openWhyModal({
                          title: `Eligibility Decision: ${student.name} (${student.id})`,
                          reasons: student.reasons,
                          factors: ['CGPA Score (>=7.5)', 'Backlogs (=0)', 'Department Enrollment', 'Graduation Year (2026)'],
                          confidence: 0.99,
                          category: 'Academic Eligibility',
                          recommendedAction: isEligible
                            ? 'Candidate qualified for Skill Role-Fit Matching and Assessment.'
                            : 'Candidate restricted from drive. TPO may grant exception if academic appeal pending.'
                        })}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Why?</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
