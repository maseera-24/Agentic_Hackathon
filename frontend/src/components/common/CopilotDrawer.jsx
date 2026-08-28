import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Wrench,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal
} from 'lucide-react';

export default function CopilotDrawer() {
  const {
    copilotOpen,
    setCopilotOpen,
    copilotMessages,
    sendCopilotMessage,
    runDemoStep,
    openWhyModal
  } = usePlacement();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!copilotOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input;
    setInput('');
    setLoading(true);
    await sendCopilotMessage(msg);
    setLoading(false);
  };

  const samplePrompts = [
    "Show me all students eligible for Google",
    "Why is Rahul Sharma eligible for Google?",
    "Find candidates with DSA proficiency above 70%",
    "What happens if Panel 2 becomes unavailable?",
    "Show all students with overlapping interviews",
    "Send reminders to students who haven't confirmed",
    "Which drives are currently at high risk?",
    "Can a student appear for a Dream drive after receiving a Core offer?"
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] bg-slate-900 text-white shadow-2xl border-l border-slate-800 flex flex-col animate-slideLeft">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">TPO Operations Copilot</h3>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono border border-indigo-500/30">
                Agentic Tools
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Natural Language Operations &amp; Analysis</p>
          </div>
        </div>

        <button
          onClick={() => setCopilotOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Command Pills */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        {samplePrompts.slice(0, 4).map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setInput(p);
            }}
            className="text-[11px] bg-slate-800 hover:bg-indigo-950 hover:border-indigo-600 border border-slate-700 text-slate-300 hover:text-indigo-200 px-2.5 py-1 rounded-full transition-all flex-shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {copilotMessages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                {!isUser && <Bot className="w-3 h-3 text-indigo-400" />}
                <span>{isUser ? 'You (TPO)' : 'Placement Orchestrator'}</span>
                <span>&middot;</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[92%] transition-all ${
                  isUser
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}
              >
                {/* Executed Tools Badges */}
                {msg.tools && msg.tools.length > 0 && (
                  <div className="mb-2.5 pb-2 border-b border-slate-700/80 flex flex-wrap gap-1.5">
                    {msg.tools.map((t, ti) => (
                      <span
                        key={ti}
                        className="inline-flex items-center gap-1 text-[10px] bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-800"
                      >
                        <Terminal className="w-2.5 h-2.5 text-indigo-400" />
                        tool: {t.name}()
                      </span>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Action Cards */}
                {msg.actionCards && msg.actionCards.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700 space-y-2">
                    {msg.actionCards.map((ac, ai) => (
                      <div
                        key={ai}
                        className="p-2.5 rounded-xl bg-slate-900 border border-indigo-900/60 flex items-center justify-between gap-2"
                      >
                        <span className="text-[11px] font-semibold text-slate-300">
                          {ac.title}
                        </span>
                        <button
                          onClick={() => {
                            if (ac.action === 'execute_recovery_plan') runDemoStep(14);
                            else if (ac.action === 'shortlist_top_candidates') runDemoStep(5);
                            else if (ac.action === 'trigger_voice_escalation') runDemoStep(18);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] shadow-sm transition-all flex items-center gap-1"
                        >
                          <span>{ac.button_text}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Agent reasoning and dispatching tool calls...</span>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask placement agent (e.g., 'Check Rahul's eligibility')..."
          className="flex-1 bg-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-indigo-600/30 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
