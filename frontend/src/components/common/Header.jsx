import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  Bot, 
  Activity, 
  PhoneCall, 
  UserCheck, 
  RotateCcw, 
  Building2, 
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function Header() {
  const { 
    drives, 
    activeDriveId, 
    setActiveDriveId, 
    userRole, 
    setUserRole, 
    copilotOpen, 
    setCopilotOpen, 
    triggerVoiceCall,
    refreshAllData,
    addToast
  } = usePlacement();

  const handleReset = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      await res.json();
      await refreshAllData();
      addToast('Demo State Reset', 'Reset all placement drives, exceptions, and candidate schedules.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand & Institution Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0 ring-2 ring-indigo-100">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                AI Placement Operations Agent
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-3 h-3 mr-0.5 text-indigo-600" />
                  v2.0 Autonomous
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Apex Institute of Technology &middot; Office of Career Services & Placement
            </p>
          </div>
        </div>

        {/* Center: Drive Selector & Live Agent Status */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">Active Drive:</span>
            <select
              value={activeDriveId}
              onChange={(e) => setActiveDriveId(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 outline-none cursor-pointer"
            >
              {drives.map(d => (
                <option key={d.id} value={d.id}>
                  {d.company_name} ({d.role_title.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Agent Operations: Online &amp; Guarded</span>
          </div>
        </div>

        {/* Right: Actions, Voice Trigger, Persona Switcher & Copilot */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Voice Demo Launcher */}
          <button
            onClick={() => triggerVoiceCall('STU003')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Launch AI Voice Call simulation for unconfirmed student"
          >
            <PhoneCall className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span className="hidden sm:inline">AI Voice Call</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 text-xs font-medium transition-all"
            title="Reset demo data to initial clean state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setUserRole('tpo')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                userRole === 'tpo'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TPO</span>
            </button>
            <button
              onClick={() => setUserRole('student')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                userRole === 'student'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
          </div>

          {/* TPO AI Copilot Trigger */}
          <button
            onClick={() => setCopilotOpen(!copilotOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              copilotOpen
                ? 'bg-indigo-700 text-white shadow-indigo-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
}
