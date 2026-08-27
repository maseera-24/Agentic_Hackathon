import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  LayoutDashboard,
  Briefcase,
  Building,
  Users,
  CheckSquare,
  Sparkles,
  Calendar,
  Layers,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  GitFork,
  BarChart3,
  Sliders,
  History,
  BookOpen,
  Settings as SettingsIcon,
  PhoneCall
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activeView, 
    setActiveView, 
    exceptions, 
    conflicts, 
    communications, 
    students 
  } = usePlacement();

  const unconfirmedCount = students.filter(s => !s.attendance_confirmed).length;
  const activeExceptionsCount = exceptions.filter(e => e.status?.includes('Pending') || e.status?.includes('Critical')).length;
  const activeConflictsCount = conflicts.length;

  const navGroups = [
    {
      group: "Core Operations",
      items: [
        { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'drives', label: 'Placement Drives & JD', icon: Briefcase, badge: 'Active' },
        { id: 'companies', label: 'Company Profiles', icon: Building, badge: null },
        { id: 'students', label: 'Candidate Pool', icon: Users, badge: `${students.length || 50}` },
      ]
    },
    {
      group: "Eligibility & Fitment",
      items: [
        { id: 'eligibility', label: 'Eligibility Verification', icon: CheckSquare, badge: 'Explainable' },
        { id: 'matching', label: 'Skill Matching Engine', icon: Sparkles, badge: 'AI Role-Fit' },
        { id: 'readiness', label: 'Readiness & 5-Day Plan', icon: BarChart3, badge: 'Personalized' },
      ]
    },
    {
      group: "Coordination & Venues",
      items: [
        { id: 'schedule', label: 'Interview Scheduler', icon: Calendar, badge: 'Multi-Panel' },
        { id: 'facilities', label: 'Panels & Venues', icon: Layers, badge: null },
        { id: 'communication', label: 'Multi-Channel Comms', icon: MessageSquare, badge: unconfirmedCount ? `${unconfirmedCount} Unconfirmed` : null, badgeColor: 'bg-amber-100 text-amber-800' },
      ]
    },
    {
      group: "Intelligent Autonomy",
      items: [
        { id: 'exceptions', label: 'Exception Recovery', icon: AlertTriangle, badge: activeExceptionsCount ? `${activeExceptionsCount} Incident` : 'Plan A Ready', badgeColor: 'bg-rose-100 text-rose-800' },
        { id: 'conflicts', label: 'Opportunity Conflicts', icon: GitFork, badge: activeConflictsCount ? `${activeConflictsCount} Overlaps` : null, badgeColor: 'bg-amber-100 text-amber-800' },
        { id: 'risks', label: 'Proactive Risk Center', icon: ShieldAlert, badge: '3 High/Med', badgeColor: 'bg-rose-100 text-rose-800' },
        { id: 'simulator', label: 'What-If Simulator', icon: Sliders, badge: 'Forecast' },
      ]
    },
    {
      group: "Governance & Knowledge",
      items: [
        { id: 'audit', label: 'Agent Audit Trail', icon: History, badge: 'Immutable' },
        { id: 'policies', label: 'Placement Policy RAG', icon: BookOpen, badge: 'College Rules' },
        { id: 'settings', label: 'System Settings', icon: SettingsIcon, badge: null },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#17152B] text-slate-300 flex flex-col h-[calc(100vh-57px)] border-r border-[#2A2649] flex-shrink-0 select-none overflow-y-auto shadow-sm">
      {/* Agent Heartbeat status banner */}
      <div className="p-3.5 mx-3 mt-3 rounded-xl bg-[#1F1C38] border border-[#2A2649] flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <div className="absolute w-4 h-4 rounded-full bg-emerald-400/30 animate-ping"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white flex items-center justify-between">
            <span>Operations Brain</span>
            <span className="text-[10px] text-emerald-400 font-mono">AUTONOMOUS</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {activeExceptionsCount > 0 ? 'Handling Panel Recovery' : 'Guarding Candidate Schedules'}
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-4 space-y-5">
        {navGroups.map((grp, idx) => (
          <div key={idx}>
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {grp.group}
            </div>
            <nav className="space-y-0.5">
              {grp.items.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-[#6D5DFB] text-white font-semibold shadow-sm shadow-[#6D5DFB]/30'
                        : 'text-slate-300 hover:text-white hover:bg-[#232040]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-tight ${
                        isActive
                          ? 'bg-[#5B4BE3] text-white'
                          : item.badgeColor || 'bg-[#232040] text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 m-3 rounded-xl bg-[#121024] border border-[#2A2649] text-[11px] text-slate-400 text-center">
        <div className="font-semibold text-white">Apex Placement Operations</div>
        <div className="text-[10px] text-slate-500 mt-0.5">Observe &middot; Reason &middot; Plan &middot; Recover</div>
      </div>
    </aside>
  );
}
