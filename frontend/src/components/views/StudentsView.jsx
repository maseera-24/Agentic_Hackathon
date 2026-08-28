import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  Users,
  Search,
  Filter,
  Award,
  Code,
  BookOpen,
  ExternalLink,
  HelpCircle,
  BarChart3,
  PhoneCall
} from 'lucide-react';

export default function StudentsView() {
  const { students, setSelectedStudentId, setActiveView, triggerVoiceCall, openWhyModal } = usePlacement();
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);

  const branches = [
    'All',
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication Engineering'
  ];

  const filteredStudents = students.filter(s => {
    const matchesBranch = branchFilter === 'All' || s.branch === branchFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.technical_skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesBranch && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              Module 14 &middot; Candidate Directory
            </span>
            <span className="text-xs text-slate-500">Graduating Batch of 2026</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Registered Student Talent Pool ({students.length})
          </h2>
          <p className="text-xs text-slate-500">
            Searchable candidate database with verified projects, coding test metrics, and skill-gap readiness scores.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name, ID, or skills (e.g. Python, Java)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold outline-none"
          >
            {branches.map(b => (
              <option key={b} value={b}>
                {b === 'All' ? 'All Engineering Branches' : b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates Grid Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => (
          <div
            key={student.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-100">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{student.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{student.id} &middot; {student.branch.split(' ')[0]}</p>
                  </div>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  student.cgpa >= 8.5
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  CGPA: {student.cgpa}
                </span>
              </div>

              {/* Skills Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {student.technical_skills?.slice(0, 5).map((skill, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Scores bar */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
                <div className="p-1.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] text-slate-400">Coding</div>
                  <div className="font-bold text-slate-900">{student.coding_score}%</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] text-slate-400">Aptitude</div>
                  <div className="font-bold text-slate-900">{student.aptitude_score}%</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] text-slate-400">Readiness</div>
                  <div className="font-bold text-indigo-600">{student.readiness?.overall || 82}%</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setActiveView('readiness');
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Skill Plan</span>
              </button>

              <button
                onClick={() => triggerVoiceCall(student.id)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold transition-all flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call AI</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
