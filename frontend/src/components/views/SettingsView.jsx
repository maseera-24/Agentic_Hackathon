import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Database,
  Sparkles,
  Check,
  Key,
  RotateCcw,
  Bot
} from 'lucide-react';

export default function SettingsView() {
  const { refreshAllData, addToast } = usePlacement();
  const [apiKey, setApiKey] = useState('');
  const [demoMode, setDemoMode] = useState(true);
  const [autoEscalation, setAutoEscalation] = useState(true);

  const handleSave = () => {
    addToast('Configuration Saved', 'System operations preferences updated.', 'success');
  };

  const handleReset = async () => {
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      await refreshAllData();
      addToast('System Reset', 'All drives, candidates, exceptions and logs reinitialized.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              Module 16 &middot; System Preferences
            </span>
            <span className="text-xs text-slate-500">Autonomous Policy &amp; Security Controls</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            System Settings &amp; AI Operational Guardrails
          </h2>
          <p className="text-xs text-slate-500">
            Configure LLM API keys, simulation modes, and human-in-the-loop gating policies.
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
        {/* LLM & AI Engine Configuration */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            AI Intelligence Model Configuration
          </h3>
          <p className="text-slate-500">
            Powered by Google Gemini models with intelligent fallback heuristics for zero-latency offline demo execution.
          </p>

          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Google Gemini API Key (Optional)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter GEMINI_API_KEY (Leave blank to use preloaded high-fidelity demo heuristics)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Autonomous Execution & Safety Guardrails */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Human-in-the-Loop Governance Guardrails
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Demo Simulation Mode</div>
                <div className="text-[11px] text-slate-500">Simulate email, push, and AI voice calls with Web Speech Synthesis</div>
              </div>
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Context-Aware Automatic Escalation</div>
                <div className="text-[11px] text-slate-500">Automatically trigger voice calls for candidates who miss push notifications</div>
              </div>
              <input
                type="checkbox"
                checked={autoEscalation}
                onChange={(e) => setAutoEscalation(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Database & State Reset */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            Data State Management
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="font-bold text-slate-900">Reset Placement Data to Initial Seed</div>
              <div className="text-[11px] text-slate-500">Reinitializes all 50 student profiles, 3 drives, 10 panels, and schedules</div>
            </div>
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
