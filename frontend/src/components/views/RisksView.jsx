import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Activity,
  PhoneCall,
  Clock,
  GitFork
} from 'lucide-react';

export default function RisksView() {
  const { openWhyModal, runDemoStep, setActiveView, addToast } = usePlacement();

  const risks = [
    {
      id: 'RISK-01',
      level: 'High',
      title: 'Panel Capacity Load Bottleneck at 2:00 PM',
      cause: 'Panel 2 experienced an emergency illness drop while candidate queue peaked.',
      potential_impact: '18 candidates face up to 45 mins delay without dynamic re-slotting.',
      recommended_action: 'Apply Autonomous Plan A: Reallocate 10 candidates to Panel 4 and 8 to Panel 5.',
      mitigationAction: () => runDemoStep(12)
    },
    {
      id: 'RISK-02',
      level: 'High',
      title: '12 Unconfirmed Candidate Attendance Slots',
      cause: '12 shortlisted candidates have not acknowledged Level 1 email notifications.',
      potential_impact: 'Idle panel waiting time exceeding 1.5 hours across active rooms.',
      recommended_action: 'Escalate communication through Level 3 Autonomous AI Voice Calls.',
      mitigationAction: () => runDemoStep(18)
    },
    {
      id: 'RISK-03',
      level: 'Medium',
      title: 'Cross-Drive Candidate Schedule Collisions',
      cause: '3 candidates scheduled simultaneously for Google R2 and Microsoft Cloud R1.',
      potential_impact: 'Candidate forced to forfeit one Tier-1 Dream placement opportunity.',
      recommended_action: 'Shift Microsoft R1 slot to afternoon buffer window (2:30 PM).',
      mitigationAction: () => setActiveView('conflicts')
    },
    {
      id: 'RISK-04',
      level: 'Low',
      title: 'Lab 1 Power Backup Switchover Notice',
      cause: 'Campus Facilities maintenance scheduled routine generator switchover.',
      potential_impact: 'Transient 15-second network reconnect in Assessment Lab 1.',
      recommended_action: 'Ensure online test clients enable local caching mode.',
      mitigationAction: () => addToast('Mitigation Confirmed', 'Local test state caching enabled.', 'info')
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
              Module 8 &middot; Predictive Intelligence
            </span>
            <span className="text-xs text-slate-500">Early Warning Detection Radar</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Proactive Placement Risk Prediction Center
          </h2>
          <p className="text-xs text-slate-500">
            Identifies structural risks before they turn into operational failures.
          </p>
        </div>
      </div>

      {/* Risk Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {risks.map((risk) => {
          const isHigh = risk.level === 'High';
          const isMed = risk.level === 'Medium';

          return (
            <div
              key={risk.id}
              className={`rounded-2xl border p-5 bg-white shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                isHigh ? 'border-rose-200 ring-2 ring-rose-50' : isMed ? 'border-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isHigh
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : isMed
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {risk.level} Risk Factor
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">{risk.id}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{risk.title}</h3>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700">Root Cause:</span>
                    <p className="text-slate-600 mt-0.5">{risk.cause}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700">Potential Impact:</span>
                    <p className="text-slate-600 mt-0.5">{risk.potential_impact}</p>
                  </div>
                </div>

                {/* AI Recommended Action Box */}
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
                  <span className="font-bold text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Recommended Proactive Mitigation:
                  </span>
                  <p className="text-indigo-950 font-medium mt-1 leading-relaxed">
                    {risk.recommended_action}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openWhyModal({
                    title: `Risk Analysis: ${risk.title}`,
                    reasons: [
                      `Identified via predictive capacity model and live telemetry.`,
                      `Cause: ${risk.cause}`,
                      `Impact: ${risk.potential_impact}`,
                      `Mitigation: ${risk.recommended_action}`
                    ],
                    factors: ['Capacity Utilization', 'Attendance Acknowledgment Rate', 'Calendar Collisions'],
                    confidence: 0.96,
                    category: 'Predictive Risk Intelligence',
                    recommendedAction: 'Execute 1-click mitigation to maintain zero placement downtime.'
                  })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Why?</span>
                </button>

                <button
                  onClick={risk.mitigationAction}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                >
                  <span>Execute Mitigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
