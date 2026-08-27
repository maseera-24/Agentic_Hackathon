import React, { useEffect, useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  Volume2, 
  User, 
  Sparkles, 
  CheckCircle2, 
  X,
  MessageSquare
} from 'lucide-react';

export default function VoiceCallModal() {
  const { voiceCallModal, setVoiceCallModal, refreshAllData, addToast } = usePlacement();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (voiceCallModal.isOpen && voiceCallModal.status.includes('Connected')) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [voiceCallModal.isOpen, voiceCallModal.status]);

  if (!voiceCallModal.isOpen) return null;

  const handleEndCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceCallModal(prev => ({ ...prev, isOpen: false }));
    addToast('Call Ended', 'Voice session closed.', 'info');
  };

  const student = voiceCallModal.student || {
    name: "Amit Patel",
    phone: "+91 98765 43212",
    branch: "ECE",
    id: "STU003"
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
        {/* Phone Top Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Autonomous AI Voice Dispatcher
            </span>
          </div>
          <button
            onClick={handleEndCall}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Call Card */}
        <div className="p-6 flex flex-col items-center text-center bg-gradient-to-b from-slate-900 to-slate-950">
          {/* Avatar with pulse ring */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white">
                <User className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            {voiceCallModal.isSpeaking && (
              <span className="absolute -inset-1 rounded-full border-2 border-indigo-400 animate-ping opacity-75"></span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">
            {student.name}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {student.phone} &middot; ID: {student.id} ({student.branch})
          </p>

          <div className="mt-3 flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-200">
              {voiceCallModal.status}
            </span>
            {voiceCallModal.status.includes('Connected') && (
              <span className="text-xs font-mono text-emerald-400 ml-1">
                {formatTimer(seconds)}
              </span>
            )}
          </div>

          {/* Animated Waveform Visualizer */}
          <div className="flex items-center justify-center gap-1.5 h-10 my-4">
            {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
              <div
                key={bar}
                className={`w-1.5 bg-gradient-to-t from-indigo-500 to-pink-400 rounded-full ${
                  voiceCallModal.isSpeaking ? 'wave-bar' : 'h-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Live Conversation Transcript Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-950/70 border-t border-slate-800/80 min-h-[220px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            Live Real-Time Audio Transcript
          </div>

          {voiceCallModal.transcript.map((item, idx) => {
            const isAI = item.speaker.includes('AI');
            const isCurrent = voiceCallModal.activeSpeechIndex === idx;

            return (
              <div
                key={idx}
                className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}
              >
                <span className="text-[10px] font-bold text-slate-400 mb-0.5 px-1">
                  {item.speaker}
                </span>
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed transition-all ${
                    isAI
                      ? isCurrent
                        ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                      : isCurrent
                      ? 'bg-pink-600 text-white font-medium shadow-md shadow-pink-600/30 ring-2 ring-pink-400'
                      : 'bg-indigo-950 text-indigo-100 border border-indigo-900'
                  }`}
                >
                  {item.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Phone Control Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-around">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>AI Voice Synthesis: Active</span>
          </div>

          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Hang Up</span>
          </button>
        </div>
      </div>
    </div>
  );
}
