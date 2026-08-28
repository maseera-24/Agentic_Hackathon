import React, { useState, useRef, useEffect } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  RefreshCw,
  Zap,
  Sliders,
  Calendar,
  Users,
  ShieldCheck,
  Building2,
  TrendingUp,
  Clock,
  Download,
  FileSpreadsheet,
  Check,
  AlertCircle
} from 'lucide-react';

export default function FloatingPlacementAgent() {
  const { 
    copilotOpen, 
    setCopilotOpen, 
    copilotMessages, 
    copilotLoading, 
    sendCopilotMessage, 
    handleAgentAction,
    userRole,
    drives,
    activeDriveId,
    setActiveDriveId
  } = usePlacement();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentDrive = drives.find(d => d.id === activeDriveId) || drives[0] || {
    company_name: 'Active Placement Drive',
    role_title: 'Software Engineer'
  };

  const officerPrompts = [
    { label: "Selected Students Excel", text: "give me the excel file of the students who are selected" },
    { label: "Non-Selected Students", text: "show me the students who were not selected" },
    { label: "Find eligible candidates", text: "Find eligible students for active drive" },
    { label: "Show top candidates", text: "Show the top candidates and rank by skill match" },
    { label: "Why was Rahul selected?", text: "Why was Rahul selected? Explain candidate match." },
    { label: "Schedule interviews", text: "Schedule interviews for eligible candidates" },
    { label: "Check conflicts", text: "Check for scheduling conflicts" },
    { label: "Notify selected students", text: "Notify selected students" },
    { label: "Show skill gaps", text: "Show the biggest student skill gaps" },
    { label: "Complete Results Excel", text: "Download complete placement results" }
  ];

  const studentPrompts = [
    { label: "What can I apply for?", text: "What drives can I apply for?" },
    { label: "Am I eligible for Google?", text: "Am I eligible for Google India?" },
    { label: "My Interview Schedule", text: "What is my interview schedule?" },
    { label: "My Placement Results", text: "What are my placement results?" },
    { label: "My Skill Gaps", text: "What are my biggest skill gaps?" },
    { label: "My Applications", text: "Show my submitted applications" }
  ];

  const suggestedPrompts = userRole === 'student' ? studentPrompts : officerPrompts;

  useEffect(() => {
    if (copilotOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [copilotOpen, copilotMessages, copilotLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || copilotLoading) return;
    const text = inputVal;
    setInputVal('');
    sendCopilotMessage(text);
  };

  const handlePromptClick = (promptText) => {
    if (copilotLoading) return;
    sendCopilotMessage(promptText);
  };

  return (
    <>
      {/* 1. FLOATING BUTTON (Visible when closed) */}
      {!copilotOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Subtle animated callout pill */}
          <div className="hidden sm:flex items-center gap-2 bg-[#151C32]/95 backdrop-blur-md border border-[#334155] text-xs px-3.5 py-1.5 rounded-full text-[#CBD5E1] shadow-xl pointer-events-none animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="font-semibold text-white">Placement Agent</span>
            <span className="text-[#94A3B8]">&middot; Ask AI</span>
          </div>

          <button
            onClick={() => setCopilotOpen(true)}
            aria-label="Open Placement Agent"
            className="group relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] text-white flex items-center justify-center shadow-hero hover:shadow-purple transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          >
            <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] opacity-50 blur-sm group-hover:opacity-100 transition duration-300 animate-pulse" />
            
            <div className="relative flex items-center justify-center">
              <Bot className="w-7 h-7 text-white animate-bounce-short" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#22C55E] border-2 border-[#0B1020]" />
            </div>
          </button>
        </div>
      )}

      {/* 2. MODERN SLIDE-UP AGENT PANEL (Visible when open) */}
      {copilotOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[460px] max-w-[calc(100vw-2rem)] h-[660px] max-h-[calc(100vh-3rem)] bg-[#0B1020] border border-[#27324A] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#F8FAFC] animate-slideUp font-sans">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0E1528] to-[#151C32] border-b border-[#27324A] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] flex items-center justify-center shadow-purple flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#F8FAFC] leading-none">AI Placement Agent</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 font-mono">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] truncate mt-1">
                  {userRole === 'student' ? 'Student Career & Interview Assistant' : 'Placement Operations Command Copilot'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setCopilotOpen(false)}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Context Banner */}
          <div className="px-4 py-2 bg-[#080C18] border-b border-[#1E293B] flex items-center justify-between text-[11px] text-[#94A3B8] flex-shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-[#06B6D4] flex-shrink-0" />
              <span className="text-[#CBD5E1] truncate font-medium">
                Active Drive: <strong className="text-white">{currentDrive.company_name}</strong> ({currentDrive.role_title})
              </span>
            </div>
            <span className="text-[10px] text-[#22C55E] flex items-center gap-1 flex-shrink-0 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Synced
            </span>
          </div>

          {/* Suggested Prompts Carousel */}
          <div className="px-3 py-2 bg-[#0F172A]/80 border-b border-[#1E293B] overflow-x-auto scrollbar-none flex items-center gap-1.5 flex-shrink-0">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(p.text)}
                disabled={copilotLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#151C32] hover:bg-[#1E293B] text-[11px] text-[#CBD5E1] hover:text-white border border-[#27324A] hover:border-[#7C3AED]/50 transition-all cursor-pointer flex-shrink-0 flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#06B6D4]" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-[#0B1020]/90">
            {copilotMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5 animate-fadeIn`}
              >
                {/* Bubble Container */}
                <div
                  className={`max-w-[90%] p-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-br-xs shadow-purple'
                      : 'bg-[#151C32] border border-[#27324A] text-[#E2E8F0] rounded-bl-xs shadow-soft'
                  }`}
                >
                  {/* Executed Tools Badge List */}
                  {msg.tools && msg.tools.length > 0 && (
                    <div className="mb-2.5 pb-2 border-b border-[#27324A] flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-[#94A3B8] font-mono flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#22D3EE]" /> Tools:
                      </span>
                      {msg.tools.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/30 text-[10px] font-mono font-semibold"
                        >
                          ✓ {t.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message Text */}
                  <div className="whitespace-pre-wrap leading-relaxed space-y-1.5">
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={lIdx} className="font-bold text-sm text-white pt-1">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('- **')) {
                        const parts = line.replace('- **', '').split('**:');
                        return (
                          <div key={lIdx} className="flex items-start gap-1.5 text-xs text-[#CBD5E1] pl-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] mt-1.5 flex-shrink-0" />
                            <span>
                              <strong className="text-white">{parts[0]}</strong>{parts.length > 1 ? `: ${parts.slice(1).join('**')}` : ''}
                            </span>
                          </div>
                        );
                      }
                      return <p key={lIdx}>{line}</p>;
                    })}
                  </div>

                  {/* Excel Download Widget Card */}
                  {(msg.structuredData?.type === 'excel_download' || msg.downloadUrl) && (
                    <div className="mt-3.5 p-3.5 rounded-xl bg-[#0B1020] border border-[#22C55E]/40 shadow-soft space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center flex-shrink-0">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-white block">
                              {msg.filename || msg.structuredData?.filename || 'Placement_Results.xlsx'}
                            </span>
                            <span className="text-[10px] text-[#94A3B8]">
                              Microsoft Excel Workbook &middot; Verified Record
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#4ADE80] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.5 rounded font-mono">
                          READY
                        </span>
                      </div>

                      <button
                        onClick={() => handleAgentAction('download_file', {
                          download_url: msg.downloadUrl || msg.structuredData?.download_url,
                          filename: msg.filename || msg.structuredData?.filename
                        })}
                        className="w-full py-2 px-3 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-soft transition-all active:scale-98 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Excel (.xlsx)</span>
                      </button>
                    </div>
                  )}

                  {/* Structured Data Table Preview */}
                  {msg.structuredData?.type === 'student_list' && msg.structuredData.students?.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#27324A] space-y-1.5">
                      <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                        Eligible Candidates Preview ({msg.structuredData.students.length}):
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {msg.structuredData.students.slice(0, 4).map((s, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between p-1.5 rounded bg-[#0B1020]/60 text-[11px]">
                            <span className="font-medium text-white">{s.name} ({s.id})</span>
                            <span className="text-[#4ADE80] font-mono">CGPA {s.cgpa}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Cards */}
                  {msg.actionCards && msg.actionCards.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#27324A] space-y-2">
                      <div className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#A78BFA]" /> Action Required:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.actionCards.map((ac, acIdx) => (
                          <button
                            key={acIdx}
                            onClick={() => handleAgentAction(ac.action, ac)}
                            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-soft cursor-pointer ${
                              ac.type === 'primary'
                                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white shadow-purple'
                                : ac.type === 'success'
                                  ? 'bg-[#16A34A] hover:bg-[#15803D] text-white'
                                  : ac.type === 'warning'
                                    ? 'bg-[#D97706] hover:bg-[#B45309] text-white'
                                    : 'bg-[#1E293B] hover:bg-[#334155] text-white border border-[#475569]'
                            }`}
                          >
                            <span>{ac.button_text || ac.title}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-[#64748B] px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Thinking / Tool Execution Indicator */}
            {copilotLoading && (
              <div className="flex items-start gap-2.5 animate-fadeIn">
                <div className="w-7 h-7 rounded-lg bg-[#151C32] border border-[#27324A] flex items-center justify-center text-[#22D3EE] flex-shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-[#151C32] border border-[#27324A] text-xs text-[#CBD5E1] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping" />
                    <span className="font-semibold text-white">Agent is executing tools...</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Evaluating database constraints, candidate records, and generating results.
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#0E1528] border-t border-[#27324A] flex items-center gap-2 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={userRole === 'student' ? 'Ask about drives, eligibility, interviews...' : 'Tell the Placement Agent what to do...'}
              disabled={copilotLoading}
              className="flex-1 bg-[#151C32] border border-[#27324A] focus:border-[#7C3AED] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || copilotLoading}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-purple cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
