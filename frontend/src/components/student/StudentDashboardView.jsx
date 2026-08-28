import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  Briefcase, 
  FileCheck, 
  Award, 
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  FileText,
  User,
  ShieldCheck
} from 'lucide-react';

export default function StudentDashboardView() {
  const { 
    currentUser, 
    studentProfile, 
    drives, 
    myApplications, 
    setStudentTab 
  } = usePlacement();

  const studentName = studentProfile?.name || currentUser?.name || 'Rahul Sharma';
  const studentId = studentProfile?.id || currentUser?.student_id || 'STU001';

  const activeDrives = drives.filter(d => (d.drive_status || d.status || '').toUpperCase() === 'ACTIVE' || (d.drive_status || d.status || '').toUpperCase().includes('PROGRESS'));
  const totalApplicationsCount = myApplications.length;
  const shortlistedCount = myApplications.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
  const selectedOffersCount = myApplications.filter(a => a.status === 'SELECTED').length;

  const upcomingInterviewApp = myApplications.find(a => 
    a.interview_details?.date && (a.status === 'INTERVIEW' || a.status === 'SHORTLISTED')
  );

  const readinessScore = studentProfile?.readiness?.score || 88;
  const breakdown = studentProfile?.readiness?.breakdown || {
    DSA: 92,
    Technical: 90,
    Aptitude: 80,
    Communication: 85,
    Resume: 95
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10 text-[#F8FAFC]">
      
      {/* 1. Compact Student Profile & Career Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151C32] border border-[#27324A] rounded-2xl p-4 sm:p-5 shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Welcome back, {studentName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40 text-[10px] font-bold uppercase tracking-wider font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
              {studentId} &middot; BATCH 2026
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            {studentProfile?.branch || 'Computer Science & Engineering'} &middot; CGPA: <strong className="text-white font-mono">{studentProfile?.cgpa || 8.9}</strong> &middot; Backlogs: <strong className="text-[#4ADE80] font-mono">0</strong> &middot; Placement Status: <span className="text-[#22D3EE] font-semibold">Active Candidate</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => setStudentTab('drives')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-bold shadow-purple flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Browse Drives</span>
          </button>
          <button
            onClick={() => setStudentTab('profile')}
            className="px-3.5 py-2 rounded-xl bg-[#0B1020] hover:bg-[#1B2340] text-[#CBD5E1] hover:text-white border border-[#27324A] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Manage Resume
          </button>
        </div>
      </div>

      {/* 2. 4 Primary Student KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div 
          onClick={() => setStudentTab('drives')}
          className="bg-[#151C32] p-5 rounded-2xl border border-[#27324A] shadow-soft hover:border-[#7C3AED] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94A3B8]">Active Drives</span>
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#F8FAFC] mt-2 group-hover:text-[#A78BFA] transition-colors">{activeDrives.length}</div>
          <div className="text-[10px] text-[#4ADE80] font-semibold mt-1">Open for application</div>
        </div>

        <div 
          onClick={() => setStudentTab('applications')}
          className="bg-[#151C32] p-5 rounded-2xl border border-[#27324A] shadow-soft hover:border-[#4F46E5] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94A3B8]">My Applications</span>
            <div className="w-8 h-8 rounded-xl bg-[#4F46E5]/20 text-[#A5B4FC] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#F8FAFC] mt-2 group-hover:text-[#A5B4FC] transition-colors">{totalApplicationsCount}</div>
          <div className="text-[10px] text-[#94A3B8] mt-1">Submitted</div>
        </div>

        <div 
          onClick={() => setStudentTab('applications')}
          className="bg-[#151C32] p-5 rounded-2xl border border-[#27324A] shadow-soft hover:border-[#8B5CF6] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94A3B8]">Shortlisted</span>
            <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 text-[#C4B5FD] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#C4B5FD] mt-2">{shortlistedCount}</div>
          <div className="text-[10px] text-[#94A3B8] mt-1">Interview stages</div>
        </div>

        <div 
          onClick={() => setStudentTab('applications')}
          className="bg-[#151C32] p-5 rounded-2xl border border-[#27324A] shadow-soft hover:border-[#22C55E] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94A3B8]">Confirmed Offers</span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#4ADE80] mt-2">{selectedOffersCount}</div>
          <div className="text-[10px] text-[#4ADE80] font-semibold mt-1">Full-time selections</div>
        </div>
      </div>

      {/* 3. Main Split: Placement Readiness (Left) + Upcoming Schedule / Active Alert (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 5 Cols: Placement Readiness & Skill Breakdown */}
        <div className="lg:col-span-5 bg-[#151C32] p-5 sm:p-6 rounded-2xl border border-[#27324A] shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27324A]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#06B6D4]" />
              <h3 className="font-bold text-sm text-white">Placement Readiness</h3>
            </div>
            <span className="text-[10px] font-mono text-[#4ADE80] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.5 rounded font-semibold">
              AI Evaluated
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B1020] border border-[#27324A]">
            <div>
              <span className="text-xs text-[#94A3B8] block">Overall Readiness Score</span>
              <span className="text-xs text-[#4ADE80] font-semibold mt-0.5">High Placement Fit</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">{readinessScore}%</div>
          </div>

          {/* Skill Breakdown */}
          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-[#CBD5E1] text-[11px] mb-1">
                <span>Data Structures &amp; Algorithms</span>
                <span className="font-bold text-white font-mono">{breakdown.DSA}%</span>
              </div>
              <div className="w-full bg-[#0B1020] rounded-full h-1.5">
                <div className="bg-[#7C3AED] h-1.5 rounded-full" style={{ width: `${breakdown.DSA}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#CBD5E1] text-[11px] mb-1">
                <span>Core Technical Proficiency</span>
                <span className="font-bold text-white font-mono">{breakdown.Technical}%</span>
              </div>
              <div className="w-full bg-[#0B1020] rounded-full h-1.5">
                <div className="bg-[#06B6D4] h-1.5 rounded-full" style={{ width: `${breakdown.Technical}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#CBD5E1] text-[11px] mb-1">
                <span>Aptitude &amp; Problem Solving</span>
                <span className="font-bold text-white font-mono">{breakdown.Aptitude}%</span>
              </div>
              <div className="w-full bg-[#0B1020] rounded-full h-1.5">
                <div className="bg-[#22C55E] h-1.5 rounded-full" style={{ width: `${breakdown.Aptitude}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#CBD5E1] text-[11px] mb-1">
                <span>Resume ATS &amp; Project Alignment</span>
                <span className="font-bold text-white font-mono">{breakdown.Resume}%</span>
              </div>
              <div className="w-full bg-[#0B1020] rounded-full h-1.5">
                <div className="bg-[#38BDF8] h-1.5 rounded-full" style={{ width: `${breakdown.Resume}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Upcoming Schedule & Active Placement Drives Hub */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Upcoming Interview Alert (if scheduled) */}
          {upcomingInterviewApp ? (
            <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-5 shadow-soft space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#7C3AED]" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                  <span className="text-xs font-bold text-[#F8FAFC]">
                    Upcoming Scheduled Interview: {upcomingInterviewApp.company_name}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#67E8F9] bg-[#06B6D4]/15 px-2.5 py-0.5 rounded-full border border-[#06B6D4]/30">
                  {upcomingInterviewApp.current_round || 'Technical Panel'}
                </span>
              </div>

              <div className="text-xs text-[#CBD5E1] flex flex-wrap items-center gap-4 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span className="font-semibold text-[#F8FAFC]">{upcomingInterviewApp.interview_details?.date}</span> at <span className="font-semibold text-[#F8FAFC]">{upcomingInterviewApp.interview_details?.time}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>{upcomingInterviewApp.interview_details?.venue || 'Block A - Room 102'}</span>
                </span>
                <span className="text-[#94A3B8] font-mono text-[11px]">
                  ({upcomingInterviewApp.interview_details?.panel_name || 'Panel B'})
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#151C32] rounded-2xl border border-[#27324A] p-4 flex items-center justify-between shadow-soft text-xs text-[#CBD5E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white block">Interview Schedule In Sync</span>
                  <span className="text-[#94A3B8] text-[11px]">All submitted applications are up to date.</span>
                </div>
              </div>
              <button
                onClick={() => setStudentTab('applications')}
                className="text-xs text-[#A78BFA] hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Status</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Drives Hub (Open to Apply) */}
          <div className="bg-[#151C32] border border-[#27324A] rounded-2xl p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#27324A]">
              <div>
                <h3 className="font-bold text-sm text-[#F8FAFC]">Active Campus Drives (Open to Apply)</h3>
                <p className="text-xs text-[#94A3B8]">Verified recruitment drives for Batch 2026.</p>
              </div>

              <button
                onClick={() => setStudentTab('drives')}
                className="text-xs font-bold text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 cursor-pointer"
              >
                <span>View All Drives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeDrives.slice(0, 4).map(drive => (
                <div 
                  key={drive.id}
                  className="p-4 rounded-xl border border-[#27324A] bg-[#0B1020] hover:border-[#7C3AED] transition-all space-y-3 flex flex-col justify-between text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-[#F8FAFC]">{drive.company_name}</h4>
                      <span className="font-mono text-xs font-bold text-[#4ADE80]">
                        {drive.package || drive.ctc || '₹ 24.0 LPA'}
                      </span>
                    </div>
                    <div className="text-xs text-[#CBD5E1]">{drive.role_title}</div>
                    <div className="text-[11px] text-[#94A3B8]">
                      Min CGPA: <span className="font-semibold text-[#F8FAFC] font-mono">{drive.requirements?.min_cgpa ?? 7.5}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#27324A] flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#4ADE80] bg-[#22C55E]/15 px-2 py-0.5 rounded border border-[#22C55E]/30">
                      Eligible to Apply
                    </span>

                    <button
                      onClick={() => setStudentTab('drives')}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-bold shadow-purple cursor-pointer"
                    >
                      View &amp; Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
