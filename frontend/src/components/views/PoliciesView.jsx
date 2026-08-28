import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  FileText, 
  ShieldCheck,
  Send,
  Lock
} from 'lucide-react';

export default function PoliciesView() {
  const { policies, openWhyModal } = usePlacement();
  const [searchQuery, setSearchQuery] = useState('');
  const [askQuery, setAskQuery] = useState('');
  const [qaAnswer, setQaAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);

  const sampleQuestions = [
    "Can this student participate in Company B after accepting Company A?",
    "What is the dream company salary threshold?",
    "What are the rules regarding active backlogs for Tier-1 companies?",
    "Under what circumstances is a student debarred from campus placements?"
  ];

  const handleAskPolicy = async (queryText) => {
    const q = queryText || askQuery;
    if (!q.trim()) return;
    setIsAsking(true);
    try {
      const res = await fetch('/api/policies/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      setQaAnswer(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAsking(false);
    }
  };

  const filteredPolicies = policies.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.rule_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              Module 13 &middot; Knowledge Agent
            </span>
            <span className="text-xs text-slate-500">Autonomous Policy RAG</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Placement Policy Knowledge Base &amp; Q&amp;A Agent
          </h2>
          <p className="text-xs text-slate-500">
            Answers eligibility, multiple-offer, and dream-company policy queries with strict rule citations.
          </p>
        </div>
      </div>

      {/* Interactive Policy Q&A Assistant */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-700/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base text-white">Ask Campus Policy Assistant</h3>
          </div>
          <span className="text-xs text-indigo-200 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-700 font-mono">
            College Constitution v2026
          </span>
        </div>

        {/* Quick Question Pills */}
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setAskQuery(sq);
                handleAskPolicy(sq);
              }}
              className="text-xs bg-indigo-950/80 hover:bg-indigo-700 border border-indigo-700/60 text-indigo-100 px-3 py-1.5 rounded-xl transition-all"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={askQuery}
            onChange={(e) => setAskQuery(e.target.value)}
            placeholder="Type any policy question (e.g., 'What happens if a student rejects an offer?')..."
            className="flex-1 bg-slate-950/70 border border-indigo-600/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-indigo-300/60 focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={() => handleAskPolicy()}
            disabled={isAsking}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{isAsking ? 'Consulting Policies...' : 'Ask Policy Agent'}</span>
          </button>
        </div>

        {/* Answer Box */}
        {qaAnswer && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-indigo-300 font-bold">
              <span>Policy Evaluation Result:</span>
              <span className="font-mono text-emerald-300">Rule Citation: {qaAnswer.rule_code || 'RULE_DREAM_01'}</span>
            </div>
            <p className="text-slate-100 text-sm leading-relaxed">{qaAnswer.answer}</p>
          </div>
        )}
      </div>

      {/* Search & Policy Cards */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policy rule title, code, or clause..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPolicies.map((pol) => (
            <div
              key={pol.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                    {pol.rule_code}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">{pol.title}</h3>
                </div>

                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {pol.category || 'Placement Policy'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {pol.summary}
              </p>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                <strong>Enforcement:</strong> {pol.enforcement || 'Automated validation on student registration.'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
