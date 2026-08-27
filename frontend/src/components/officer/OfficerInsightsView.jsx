import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  TrendingUp, 
  Sparkles, 
  BarChart3, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Award,
  Zap,
  Users,
  Building2,
  Calendar,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OfficerInsightsView() {
  const { officerStudents, addToast } = usePlacement();
  const [selectedBranch, setSelectedBranch] = useState('All');

  const totalStudents = officerStudents.length || 50;

  // Branch statistics
  const branchData = [
    { branch: 'Computer Science & Engineering', avgReadiness: 84.5, highPct: 78, gap: 'System Design', count: 20 },
    { branch: 'Information Technology', avgReadiness: 81.2, highPct: 72, gap: 'Cloud (AWS/Docker)', count: 14 },
    { branch: 'Artificial Intelligence & Data Science', avgReadiness: 79.4, highPct: 68, gap: 'Data Structures', count: 10 },
    { branch: 'Electronics & Communication', avgReadiness: 72.8, highPct: 54, gap: 'SQL & Databases', count: 6 },
  ];

  // Top Student Skill Gaps
  const skillGaps = [
    { skill: 'SQL & Database Optimization', affectedCount: 24, gapPct: 28, category: 'Databases', priority: 'High', workshop: '3-Day SQL Masterclass' },
    { skill: 'Cloud Deployment (AWS/Docker)', affectedCount: 22, gapPct: 26, category: 'DevOps', priority: 'High', workshop: 'Hands-on Docker & Cloud Basics' },
    { skill: 'Data Structures & Algorithms', affectedCount: 19, gapPct: 22, category: 'Coding', priority: 'High', workshop: 'LeetCode Pattern Sprint' },
    { skill: 'System Design & Scalability', affectedCount: 17, gapPct: 20, category: 'Backend', priority: 'Medium', workshop: 'High-Level System Design Workshop' },
    { skill: 'FastAPI & REST Architecture', affectedCount: 14, gapPct: 16, category: 'Web Services', priority: 'Medium', workshop: 'Production API Development' }
  ];

  const handleScheduleWorkshop = (workshopTitle) => {
    addToast('Workshop Scheduled', `${workshopTitle} scheduled and invitations dispatched to affected students.`, 'success');
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10 text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">Placement Insights &amp; Skill Gaps</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 text-xs font-semibold">
              Cohort Analysis 2026
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Holistic student placement readiness, cohort skill deficits, and automated workshop interventions.
          </p>
        </div>

        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="bg-[#151C32] border border-[#27324A] text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-[#7C3AED] cursor-pointer"
        >
          <option value="All">All Engineering Branches</option>
          <option value="CSE">Computer Science &amp; Engineering</option>
          <option value="IT">Information Technology</option>
          <option value="AIDS">Artificial Intelligence &amp; Data Science</option>
          <option value="ECE">Electronics &amp; Communication</option>
        </select>
      </div>

      {/* Top Readiness Score Card Banner */}
      <div className="rounded-3xl gradient-command-hero p-6 sm:p-7 shadow-hero border border-[#27324A] relative overflow-hidden ai-grid-pattern-dark">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06B6D4]/20 text-[#22D3EE] border border-[#06B6D4]/40 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#22D3EE]" />
              AI Cohort Evaluation
            </div>
            <h3 className="text-2xl font-bold text-white">81.4% Overall Placement Readiness</h3>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Based on continuous evaluation of coding assessments, academic records, resume parsing, and mock interviews across {totalStudents} registered candidates.
            </p>
          </div>

          <div className="bg-[#0B1020]/70 p-4 rounded-2xl border border-[#27324A] flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-[#94A3B8]">High Readiness Tier</span>
            <div className="text-3xl font-bold text-[#4ADE80] mt-1">36 Students</div>
            <span className="text-[11px] text-[#94A3B8] mt-0.5">Ready for Tier-1 Dream Drives</span>
          </div>

          <div className="bg-[#0B1020]/70 p-4 rounded-2xl border border-[#27324A] flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-[#94A3B8]">Intervention Needed</span>
            <div className="text-3xl font-bold text-[#F59E0B] mt-1">14 Students</div>
            <span className="text-[11px] text-[#94A3B8] mt-0.5">Targeted skill workshops queued</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Skill Gaps on Left + AI Recommendations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Top Skill Gaps */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#A78BFA]" />
                  <span>Top Student Skill Deficits</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Aggregate gap between student proficiency and upcoming employer criteria.
                </p>
              </div>
              <span className="text-xs font-mono text-[#A78BFA] bg-[#7C3AED]/15 px-2.5 py-1 rounded-lg border border-[#7C3AED]/30">
                5 Deficits Identified
              </span>
            </div>

            <div className="space-y-4">
              {skillGaps.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0B1020] border border-[#27324A] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{item.skill}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.priority === 'High' 
                            ? 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30' 
                            : 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30'
                        }`}>
                          {item.priority} Priority
                        </span>
                      </div>
                      <span className="text-[11px] text-[#94A3B8] font-mono">
                        {item.affectedCount} Candidates affected ({item.category})
                      </span>
                    </div>

                    <button
                      onClick={() => handleScheduleWorkshop(item.workshop)}
                      className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#7C3AED]/30 text-[#A78BFA] hover:text-white border border-[#334155] hover:border-[#7C3AED] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Zap className="w-3 h-3 text-[#A78BFA]" />
                      <span>Schedule Workshop</span>
                    </button>
                  </div>

                  {/* Progress bar representing gap */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                      <span>Average Cohort Deficit</span>
                      <span className="font-bold text-white">{item.gapPct}% Gap</span>
                    </div>
                    <div className="w-full bg-[#151C32] h-2 rounded-full overflow-hidden border border-[#27324A]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444]"
                        style={{ width: `${item.gapPct * 3}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch-wise Breakdown */}
          <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-5 shadow-soft">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#06B6D4]" />
              <span>Branch-wise Readiness Breakdown</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branchData.map((b, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#0B1020] border border-[#27324A] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white truncate max-w-[160px]">{b.branch}</span>
                    <span className="text-xs font-bold text-[#4ADE80]">{b.avgReadiness}%</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] flex items-center justify-between">
                    <span>{b.count} Students</span>
                    <span className="text-[#F59E0B]">Top Gap: {b.gap}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Recommendations for Placement Officer */}
        <div className="space-y-4">
          <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-5 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#06B6D4]/15 text-[#22D3EE] flex items-center justify-center border border-[#06B6D4]/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">AI Placement Recommendations</h3>
                <span className="text-[10px] text-[#94A3B8]">Actionable interventions</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0B1020] border border-[#27324A] space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                  <span>Conduct SQL Bootcamp</span>
                </div>
                <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                  24 candidates have SQL as a primary skill deficit. Conducting a 3-day SQL workshop before the upcoming Amazon &amp; Google drives will increase selection rate by an estimated 35%.
                </p>
                <button
                  onClick={() => handleScheduleWorkshop('3-Day SQL Masterclass')}
                  className="w-full py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  <span>Launch Workshop</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1020] border border-[#27324A] space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>Resume &amp; Project Polish</span>
                </div>
                <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                  12 candidates lack cloud deployment links on their profiles. An automated reminder can guide them to deploy their projects on AWS/Vercel.
                </p>
                <button
                  onClick={() => addToast('Reminders Queued', 'Dispatched project polish guidelines to 12 students.', 'info')}
                  className="w-full py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white font-semibold text-xs border border-[#475569] cursor-pointer transition-all"
                >
                  Notify Students
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
