import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Layers,
  DoorOpen,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export default function SimulatorView() {
  const { openWhyModal, addToast } = usePlacement();

  const [selectedScenario, setSelectedScenario] = useState('more_candidates');
  const [candidateDelta, setCandidateDelta] = useState(30);
  const [panelId, setPanelId] = useState('PANEL_02');
  const [timeShift, setTimeShift] = useState('15:00');
  const [durationIncrease, setDurationIncrease] = useState(15);
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const scenarioPresets = [
    { id: 'more_candidates', label: 'Shortlist +30 More Candidates', icon: Users, desc: 'What if recruiter relaxes cutoff and adds 30 more candidates?' },
    { id: 'panel_failure', label: 'Panel 2 Drops Out', icon: AlertTriangle, desc: 'What if Panel 2 becomes unavailable right before 10 AM round?' },
    { id: 'time_shift', label: 'Company Moves Drive to 3 PM', icon: Clock, desc: 'What if company delays drive start to afternoon session?' },
    { id: 'duration_increase', label: 'Interview Duration +15 Mins', icon: Sliders, desc: 'What if interview duration expands from 30 mins to 45 mins?' },
  ];

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      let params = {};
      if (selectedScenario === 'more_candidates') params = { candidate_delta: candidateDelta };
      else if (selectedScenario === 'panel_failure') params = { panel_id: panelId };
      else if (selectedScenario === 'time_shift') params = { new_time: timeShift };
      else if (selectedScenario === 'duration_increase') params = { duration_increase_mins: durationIncrease };

      const res = await fetch('/api/simulator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_type: selectedScenario, params })
      });
      const data = await res.json();
      setSimResult(data);
      addToast('Simulation Complete', 'Projected consequences & generated solution.', 'success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              Module 11 &middot; Scenario Sandbox
            </span>
            <span className="text-xs text-slate-500">Zero-Risk Consequence Forecasting</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            What-If Placement Operations Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Simulates disruptions and volume surges without modifying active live placement calendars.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isSimulating ? 'Computing Simulation...' : 'Run Simulation'}</span>
        </button>
      </div>

      {/* Preset Scenario Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {scenarioPresets.map(sc => {
          const Icon = sc.icon;
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => {
                setSelectedScenario(sc.id);
                setSimResult(null);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-100 shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border-2 ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">{sc.label}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{sc.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parameters & Simulation Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Scenario Parameters Sandbox */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Scenario Parameters
          </h3>

          <div className="space-y-4 text-xs">
            {selectedScenario === 'more_candidates' && (
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Additional Candidates:</span>
                  <span className="font-bold text-indigo-600">+{candidateDelta} Candidates</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={candidateDelta}
                  onChange={(e) => setCandidateDelta(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>+5</span>
                  <span>+30</span>
                  <span>+60</span>
                </div>
              </div>
            )}

            {selectedScenario === 'panel_failure' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Panel Dropping Out</label>
                <select
                  value={panelId}
                  onChange={(e) => setPanelId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="PANEL_02">Panel 2 (Backend Systems - 18 Max Cap)</option>
                  <option value="PANEL_01">Panel 1 (Algorithms &amp; Core - 18 Max Cap)</option>
                  <option value="PANEL_03">Panel 3 (Full Stack &amp; DB - 18 Max Cap)</option>
                </select>
              </div>
            )}

            {selectedScenario === 'time_shift' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Drive Start Time</label>
                <input
                  type="time"
                  value={timeShift}
                  onChange={(e) => setTimeShift(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-medium"
                />
              </div>
            )}

            {selectedScenario === 'duration_increase' && (
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Duration Extension:</span>
                  <span className="font-bold text-indigo-600">+{durationIncrease} Mins/Slot</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={durationIncrease}
                  onChange={(e) => setDurationIncrease(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              💡 <strong>Simulation Sandbox:</strong> Changes made here are strictly isolated. No database writes occur until explicitly authorized by the TPO.
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Predicted Impact & AI Solution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Predicted Consequence &amp; Capacity Impact
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              AI Forecast
            </span>
          </div>

          {/* Metric Projection Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400">Affected Candidates</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {simResult ? simResult.impact?.affected_students : candidateDelta}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400">Expected Delay</div>
              <div className="text-xl font-black text-amber-600 mt-0.5">
                {simResult ? simResult.impact?.expected_delay : '+45 mins'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400">Extra Panels Required</div>
              <div className="text-xl font-black text-indigo-600 mt-0.5">
                {simResult ? simResult.impact?.new_panels_needed : '+2 Panels'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400">Projected Risk Level</div>
              <div className="text-xl font-black text-rose-600 mt-0.5">
                {simResult ? simResult.impact?.risk_level : 'Medium'}
              </div>
            </div>
          </div>

          {/* AI Recommended Solution Card */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
            <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Agent Recommended Operational Strategy:
            </div>
            <p className="text-xs text-indigo-950 font-medium leading-relaxed">
              {simResult?.recommended_solution?.action || 'Activate Backup Panel 7 & Panel 8 in Block B. Re-allocate candidate batches into two parallel 45-minute slots to avoid campus curfew and student overlap.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
