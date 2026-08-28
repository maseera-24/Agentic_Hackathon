import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  Users, 
  Sliders,
  Check,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExceptionsView() {
  const { exceptions, openWhyModal, refreshAllData, runDemoStep, addToast } = usePlacement();
  const [loadingAction, setLoadingAction] = useState(false);

  const handleApprove = async (excId) => {
    setLoadingAction(true);
    try {
      await fetch(`/api/exceptions/${excId}/approve`, { method: 'POST' });
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
      addToast('Recovery Executed', 'Plan A successfully applied! 18 student slots re-routed to Panel 4 & 5. Notifications dispatched.', 'success');
      await refreshAllData();
      runDemoStep(15);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async (excId) => {
    try {
      await fetch(`/api/exceptions/${excId}/reject`, { method: 'POST' });
      addToast('Recovery Rejected', 'Flagged for manual TPO scheduling override.', 'info');
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const triggerPanel2Down = async () => {
    try {
      await fetch('/api/exceptions/trigger_demo_exception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panel_id: 'PANEL_02' })
      });
      addToast('Live Incident Triggered', 'Panel 2 marked unavailable. Exception Agent formulated recovery plan.', 'warning');
      await refreshAllData();
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
            <span className="text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
              Module 7 &middot; Autonomous Resilience
            </span>
            <span className="text-xs text-slate-500">Autonomous Incident Detection &amp; Recovery</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Placement Exception Recovery Agent
          </h2>
          <p className="text-xs text-slate-500">
            Continuously monitors live drive operations. Formulates alternative recovery plans when resources fail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerPanel2Down}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Panel 2 Failure</span>
          </button>
        </div>
      </div>

      {/* Exception Cards Stream */}
      <div className="space-y-6">
        {exceptions.map((exc) => {
          const isResolved = exc.status?.includes('Resolved');
          return (
            <div
              key={exc.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm space-y-5 transition-all ${
                isResolved ? 'border-emerald-200' : 'border-rose-200 ring-2 ring-rose-50'
              }`}
            >
              {/* Incident Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl text-white ${
                    isResolved ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}>
                    {isResolved ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {exc.severity || 'High Severity'}
                      </span>
                      <span className="text-xs font-mono text-slate-400 font-bold">{exc.id}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(exc.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">{exc.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{exc.description}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {exc.status}
                  </span>
                </div>
              </div>

              {/* Impact Detection Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Affected Candidates</div>
                  <div className="text-lg font-black text-rose-600 mt-0.5">18 Candidates</div>
                  <div className="text-[10px] text-slate-500">Scheduled between 10:00 AM - 1:00 PM</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Potential Drive Delay</div>
                  <div className="text-lg font-black text-amber-600 mt-0.5">+45 Minutes</div>
                  <div className="text-[10px] text-slate-500">Without autonomous recovery re-routing</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Room Status</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">0 Collisions</div>
                  <div className="text-[10px] text-slate-500">Available backup slots verified</div>
                </div>
              </div>

              {/* Side-by-Side Alternative Plans: Plan A vs Plan B */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Agent Generated Alternative Recovery Plans
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plan A: Recommended */}
                  <div className="p-4 rounded-xl bg-indigo-50/60 border-2 border-indigo-200 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        Plan A (Recommended &middot; 96% Fit)
                      </span>
                      <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded">
                        Optimal
                      </span>
                    </div>
                    <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                      Move <strong>10 candidates to Panel 4</strong> and <strong>8 candidates to Panel 5</strong>. Both panels have identical technical expertise and available buffer capacity.
                    </p>
                    <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-2 pt-1 border-t border-indigo-100">
                      <span>Delay: <strong>&lt; 8 mins</strong></span>
                      <span>&middot;</span>
                      <span>Venue: <strong>Rooms 104 &amp; 105</strong></span>
                    </div>
                  </div>

                  {/* Plan B: Fallback */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Plan B (Sequential Afternoon Extension)
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                        Alternative
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Extend afternoon session for remaining active panels by 45 minutes after lunch break (2:00 PM - 4:30 PM).
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-200">
                      <span>Delay: <strong>+35 mins</strong></span>
                      <span>&middot;</span>
                      <span>Venue: <strong>Current Rooms</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Approve, Modify, Reject, Why) */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => openWhyModal({
                    title: `Why Plan A for ${exc.title}?`,
                    reasons: [
                      'Panel 4 and Panel 5 share identical technical expertise tags (Distributed Systems, Java, C++).',
                      'Panel 4 has 10 open slots; Panel 5 has 8 open slots between 10:30 AM and 1:00 PM.',
                      'Moving all 18 candidates prevents overall drive delay from extending beyond 8 minutes.',
                      'No students suffer schedule collisions with other company tests.'
                    ],
                    factors: ['Technical Tag Compatibility', 'Buffer Capacity', 'Candidate Wait Time', 'Room Availability'],
                    confidence: 0.98,
                    category: 'Exception Recovery Optimization',
                    recommendedAction: 'Approve Plan A to synchronize calendar and notify students.'
                  })}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Explain AI Recovery Reasoning</span>
                </button>

                {!isResolved && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(exc.id)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                    >
                      Reject / Manual TPO Override
                    </button>

                    <button
                      onClick={() => handleApprove(exc.id)}
                      disabled={loadingAction}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{loadingAction ? 'Applying Changes...' : 'Approve & Execute Plan A'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
