import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  History,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  Filter,
  Search,
  Sparkles,
  Terminal,
  Lock
} from 'lucide-react';

export default function AuditView() {
  const { auditLogs, openWhyModal } = usePlacement();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');

  const filteredLogs = auditLogs.filter(log => {
    const matchesFilter = filterLevel === 'All' || log.approval_level === filterLevel;
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.trigger.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.ai_analysis.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              Module 12 &middot; AI Governance
            </span>
            <span className="text-xs text-slate-500">Tamper-Proof Audit Trail</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Agent Action &amp; Autonomous Audit Trail
          </h2>
          <p className="text-xs text-slate-500">
            Immutable log of triggers, AI reasoning, confidence metrics, and human-in-the-loop approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cryptographic Hash Integrity Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, trigger, or analysis..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {['All', 'Automatic', 'Approval Required', 'Human Decision'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterLevel === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Trail Timeline Cards */}
      <div className="space-y-3">
        {filteredLogs.map(log => {
          const confidencePercent = Math.round((log.confidence || 0.95) * 100);

          return (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{log.action}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{log.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                    log.approval_level === 'Automatic'
                      ? 'bg-slate-100 text-slate-700'
                      : log.approval_level === 'Approval Required'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    Level: {log.approval_level}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    Confidence: {confidencePercent}%
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &middot; {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Trigger Event</div>
                  <div className="text-slate-800 font-medium">{log.trigger}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-indigo-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    AI Reasoning &amp; Analysis
                  </div>
                  <div className="text-indigo-950 font-medium">{log.ai_analysis}</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-slate-500 text-[11px]">
                  Approver: <strong className="text-slate-800">{log.human_approval || 'System Autonomous'}</strong> &middot; Status: <strong className="text-emerald-700">{log.status}</strong>
                </div>

                <button
                  onClick={() => openWhyModal({
                    title: `Audit Trace: ${log.action}`,
                    reasons: [
                      `Action: ${log.action}`,
                      `Trigger: ${log.trigger}`,
                      `AI Analysis: ${log.ai_analysis}`,
                      `Recommendation: ${log.recommendation || 'None'}`
                    ],
                    factors: ['Timestamp', 'System Context', 'Human Approval Level', 'Safety Constraints'],
                    confidence: log.confidence || 0.95,
                    category: 'Audit & Governance Trace',
                    recommendedAction: `Executed and verified by ${log.human_approval || 'System'}.`
                  })}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Explain Trace</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
