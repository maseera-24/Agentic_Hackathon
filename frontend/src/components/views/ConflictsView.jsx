import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  GitFork, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  Check
} from 'lucide-react';

export default function ConflictsView() {
  const { conflicts, openWhyModal, refreshAllData, addToast } = usePlacement();

  const handleResolveConflict = async (conflictId) => {
    try {
      await fetch('/api/conflicts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflict_id: conflictId, action: 'auto_buffer_shift' })
      });
      addToast('Opportunity Protected', 'Candidate second event shifted to buffer window. Zero opportunity loss.', 'success');
      refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
              Module 9 &middot; Candidate Opportunity Shield
            </span>
            <span className="text-xs text-slate-500">Autonomous Collision Resolution</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Student Opportunity Conflict Engine
          </h2>
          <p className="text-xs text-slate-500">
            Detects simultaneous interview/test schedules across multiple drives and protects 100% of candidate placement opportunities.
          </p>
        </div>
      </div>

      {/* Opportunity Protection Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950">
          <strong>Core Governance Principle:</strong> The AI Agent never forces a student to forfeit an opportunity due to college-level schedule collisions. Instead, it re-routes secondary rounds to reserved afternoon buffer slots.
        </div>
      </div>

      {/* Conflicts List */}
      <div className="space-y-4">
        {conflicts.map((conf) => (
          <div
            key={conf.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-100 text-orange-800 rounded-xl">
                  <GitFork className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {conf.student_name} <span className="font-mono text-xs text-slate-400">({conf.student_id})</span>
                  </h3>
                  <p className="text-xs text-slate-500">{conf.student_branch}</p>
                </div>
              </div>

              <span className="text-xs font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                Simultaneous Time Collision
              </span>
            </div>

            {/* Side-by-Side Colliding Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-700">{conf.event_1?.company}</span>
                  <span className="font-mono text-slate-500">{conf.event_1?.time}</span>
                </div>
                <div className="font-semibold text-slate-800">{conf.event_1?.round}</div>
                <div className="text-[11px] text-slate-500">Venue: {conf.event_1?.venue} &middot; Duration: 45m</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-700">{conf.event_2?.company}</span>
                  <span className="font-mono text-slate-500">{conf.event_2?.time}</span>
                </div>
                <div className="font-semibold text-slate-800">{conf.event_2?.round}</div>
                <div className="text-[11px] text-slate-500">Venue: {conf.event_2?.venue} &middot; Duration: 90m</div>
              </div>
            </div>

            {/* AI Resolution Recommendation */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                AI Recommended Opportunity Protection Solution:
              </div>
              <p className="text-emerald-950 font-medium leading-relaxed">
                {conf.resolution?.recommended_action || 'Retain Google Technical Interview 2 at 10:00 AM. Shift Microsoft Assessment Challenge to afternoon buffer window (2:30 PM) in Lab 1.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => openWhyModal({
                  title: `Conflict Resolution: ${conf.student_name}`,
                  reasons: [
                    `${conf.student_name} is shortlisted for both Google (Tier-1) and Microsoft (Tier-1).`,
                    `Forcing candidate to choose creates irreversible placement opportunity loss.`,
                    `Microsoft assessment allows asynchronous testing window with Proctor active until 4:00 PM.`,
                    `Shifting Microsoft test to 2:30 PM preserves 100% of candidate placement opportunities.`
                  ],
                  factors: ['Company Tier Policy', 'Proctor Availability', 'Round Format (Interview vs Test)', 'Candidate Rights'],
                  confidence: 0.99,
                  category: 'Opportunity Conflict Resolution',
                  recommendedAction: 'Approve buffer shift to preserve candidate multi-offer eligibility.'
                })}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why this resolution?</span>
              </button>

              <button
                onClick={() => handleResolveConflict(conf.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply Opportunity Protection Shift</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
