import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Bot,
  Menu,
  X,
  Sparkles,
  Building2
} from 'lucide-react';
import ProfileMenu from '../common/ProfileMenu';
import ToastContainer from '../common/ToastContainer';
import FloatingPlacementAgent from '../common/FloatingPlacementAgent';

export default function OfficerLayout({ children }) {
  const {
    officerTab,
    setOfficerTab,
    drives,
    activeDriveId,
    setActiveDriveId,
    setCopilotOpen
  } = usePlacement();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exactly 5 Primary Navigation Items as per requirements
  const primaryNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'drives', label: 'Job Drives', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  const currentDrive = drives.find(d => d.id === activeDriveId) || drives[0] || {
    company_name: 'Active Placement Drive',
    role_title: 'Software Engineer'
  };

  return (
    <div className="min-h-screen bg-[#0B1020] flex flex-col md:flex-row antialiased text-[#F8FAFC] font-sans">
      {/* Desktop Command Center Sidebar */}
      <aside className="hidden md:flex flex-col justify-between bg-[#0B1020] text-[#CBD5E1] w-64 flex-shrink-0 border-r border-[#27324A] select-none shadow-hero z-20">
        <div className="flex flex-col h-full overflow-hidden">

          {/* Top Brand Header */}
          <div className="p-4 border-b border-[#27324A] bg-[#080C18]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center font-bold text-white shadow-purple flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs tracking-tight text-[#F8FAFC] block truncate leading-snug">
                  AI Placement Agent
                </span>
                <span className="text-[10px] font-semibold text-[#06B6D4] flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                  OPERATIONS ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* 5 Primary Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 text-xs">
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] px-3 py-1 mb-1">
              OPERATIONS PORTAL
            </div>

            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = officerTab === item.id ||
                (item.id === 'candidates' && (officerTab === 'students' || officerTab === 'eligibility' || officerTab === 'skill_matching')) ||
                (item.id === 'interviews' && (officerTab === 'schedules' || officerTab === 'panels_rooms' || officerTab === 'conflicts')) ||
                (item.id === 'insights' && (officerTab === 'readiness' || officerTab === 'evaluation'));

              return (
                <button
                  key={item.id}
                  onClick={() => setOfficerTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-purple'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#151C32]'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'
                  }`} />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-4 rounded-full bg-white absolute right-1.5 shadow-sm" />
                  )}
                </button>
              );
            })}

            {/* Quick AI Agent Trigger Card in Sidebar */}
            <div className="pt-6 px-1">
              <div
                onClick={() => setCopilotOpen(true)}
                className="p-3 rounded-2xl bg-gradient-to-tr from-[#1E1B4B] to-[#151C32] border border-[#7C3AED]/40 hover:border-[#7C3AED] transition-all cursor-pointer shadow-purple space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center shadow-soft">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-[#4ADE80] bg-[#22C55E]/15 px-1.5 py-0.5 rounded border border-[#22C55E]/30">
                    Online
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-[#A78BFA] transition-colors">Placement Agent</h4>
                  <p className="text-[10px] text-[#94A3B8] leading-tight mt-0.5">Click to talk or execute operational tools.</p>
                </div>
              </div>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3.5 border-t border-[#27324A] bg-[#080C18] text-[10px] text-[#94A3B8] flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#CBD5E1] block">Apex Institute &copy; 2026</span>
              <span className="text-[9px] text-[#94A3B8]">AI Placement Ops Agent</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" title="Atlas Database Synced" />
          </div>
        </div>
      </aside>

      {/* Main Command Center Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1020]">

        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#111827]/95 backdrop-blur-md border-b border-[#27324A] shadow-soft px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#151C32] hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="font-medium text-[#94A3B8]">Operations</span>
              <span className="text-[#334155]">/</span>
              <span className="font-bold text-[#F8FAFC] capitalize">
                {officerTab.replace('_', ' ')}
              </span>
            </div>

            {/* Active Drive Context Selector */}
            <div className="flex items-center gap-1.5 bg-[#151C32] border border-[#27324A] px-2.5 py-1 rounded-xl text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#06B6D4]" />
              <select
                value={activeDriveId || ''}
                onChange={(e) => setActiveDriveId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#F8FAFC] focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[240px] truncate"
              >
                {drives.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#151C32] text-[#F8FAFC]">
                    {d.company_name} - {d.role_title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Controls: AI Agent Online Pill + ProfileMenu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCopilotOpen(true)}
              className="flex items-center gap-1.5 bg-[#22C55E]/15 hover:bg-[#22C55E]/25 text-[#4ADE80] border border-[#22C55E]/30 px-3 py-1 rounded-full text-xs font-semibold shadow-xs cursor-pointer transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="font-bold text-[11px] hidden sm:inline">AI AGENT READY</span>
              <Bot className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {/* User Profile Dropdown */}
            <ProfileMenu />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#27324A] bg-[#0B1020] px-4 py-3 space-y-1.5 text-[#CBD5E1] z-40">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = officerTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setOfficerTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:bg-[#151C32]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Command Center Footer */}
        <footer className="border-t border-[#27324A] bg-[#080C18] py-3 px-6 text-center text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Apex Institute of Technology &middot; AI Placement Operations Platform &copy; 2026</span>
          <span className="text-[11px] text-[#A78BFA] font-semibold">Autonomous Operations Agent Connected</span>
        </footer>
      </div>

      {/* Persistent Floating AI Robot Agent across all pages */}
      <FloatingPlacementAgent />

      <ToastContainer />
    </div>
  );
}
