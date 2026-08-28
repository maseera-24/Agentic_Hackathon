import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  MessageSquare,
  Mail,
  Bell,
  PhoneCall,
  Send,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Users
} from 'lucide-react';

export default function CommunicationView() {
  const {
    communications,
    students,
    triggerVoiceCall,
    refreshAllData,
    addToast
  } = usePlacement();

  const [selectedStudent, setSelectedStudent] = useState('STU001');
  const [channel, setChannel] = useState('Email');
  const [subject, setSubject] = useState('Shortlist Notification & Interview Schedule');
  const [messageBody, setMessageBody] = useState(
    `Hello {student_name},\n\nCongratulations! You have been shortlisted for Google India (Software Development Engineer - I).\n\nRound: Technical Interview 2\nDate: Tomorrow, 10:00 AM\nVenue: Block A, Room 102\n\nPlease arrive 15 minutes before the scheduled slot with your college ID card and updated resume.`
  );

  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    setIsSending(true);
    try {
      const studentObj = students.find(s => s.id === selectedStudent) || students[0];
      const interpolated = messageBody
        .replace('{student_name}', studentObj.name)
        .replace('{company}', 'Google India')
        .replace('{role}', 'SDE-1');

      if (channel === 'AI Voice Call') {
        await triggerVoiceCall(selectedStudent);
      } else {
        await fetch('/api/communication/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: selectedStudent,
            channel,
            subject,
            message: interpolated
          })
        });
        addToast('Message Dispatched', `${channel} delivered to ${studentObj.name}.`, 'success');
        refreshAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleEscalateAll = async () => {
    try {
      const res = await fetch('/api/communication/escalate_unconfirmed', { method: 'POST' });
      await res.json();
      await refreshAllData();
      addToast('Escalation Complete', 'AI voice calls triggered for unconfirmed candidates.', 'success');
      triggerVoiceCall('STU003');
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
            <span className="text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
              Module 6 &middot; Multi-Channel Agent
            </span>
            <span className="text-xs text-slate-500">Email &middot; App Push &middot; AI Voice Call</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Communication &amp; Context-Aware Escalation Hub
          </h2>
          <p className="text-xs text-slate-500">
            Intelligently routes messages and escalates unconfirmed candidates from Email to Push to Autonomous AI Voice.
          </p>
        </div>

        <button
          onClick={handleEscalateAll}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
          <span>Escalate Unconfirmed Candidates</span>
        </button>
      </div>

      {/* Context-Aware Escalation Flow Matrix Diagram */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-900/60 shadow-lg">
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          Autonomous Multi-Stage Escalation Ladder
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-300">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Level 1: Email
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Full schedule breakdown &amp; admit card attachment</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-300">
              <Bell className="w-3.5 h-3.5 text-amber-400" /> Level 2: App Push
            </div>
            <p className="text-[10px] text-slate-400 mt-1">High-priority alert if unacknowledged after 2 hours</p>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-800 ring-2 ring-purple-500/40">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-purple-300">
              <PhoneCall className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Level 3: AI Voice Call
            </div>
            <p className="text-[10px] text-purple-200 mt-1">Natural conversational voice agent confirms attendance</p>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-300">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Level 4: TPO Incident
            </div>
            <p className="text-[10px] text-rose-200 mt-1">Creates exception if candidate unreachable</p>
          </div>
        </div>
      </div>

      {/* Grid: Message Composer & Live Dispatch Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Personalized Message Composer */}
        <form onSubmit={handleSendMessage} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Dynamic Candidate Message Composer
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Personalized Templates</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Candidate</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none focus:border-indigo-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) &middot; {s.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Email', icon: Mail },
                  { id: 'App Notification', icon: Bell },
                  { id: 'AI Voice Call', icon: PhoneCall },
                ].map(ch => {
                  const Icon = ch.icon;
                  return (
                    <button
                      type="button"
                      key={ch.id}
                      onClick={() => setChannel(ch.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        channel === ch.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{ch.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {channel === 'Email' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-medium outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Message Body</label>
              <textarea
                rows={7}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono leading-relaxed outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching...' : `Send via ${channel}`}</span>
            </button>
          </div>
        </form>

        {/* Right Col: Live Multi-Channel Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Live Communication Activity Log ({communications.length})
              </h3>
              <span className="text-xs text-slate-400">All Multi-Channel Dispatches</span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {communications.map((comm) => (
                <div
                  key={comm.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        comm.channel === 'AI Voice Call'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : comm.channel === 'Email'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {comm.channel}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{comm.student_name}</span>
                    </div>

                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      {comm.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-mono leading-tight bg-white p-2 rounded-lg border border-slate-100 truncate">
                    {comm.message}
                  </p>

                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>Recipient: {comm.recipient}</span>
                    <span>{new Date(comm.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
