import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  GraduationCap, 
  Building2, 
  Calendar, 
  Clock, 
  DoorOpen, 
  CheckCircle2, 
  Award, 
  Code, 
  Sparkles, 
  BookOpen, 
  Bell, 
  Check,
  PhoneCall
} from 'lucide-react';

export default function StudentPortalView() {
  const { students, selectedStudentId, setSelectedStudentId, triggerVoiceCall, addToast } = usePlacement();
  const [completedPlanDays, setCompletedPlanDays] = useState([1]);

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const studentSchedules = [
    {
      company: 'Google India',
      role: 'Software Development Engineer - I (SDE-1)',
      round: 'Technical Interview 2 (DSA & Architecture)',
      date: 'Tomorrow (22 Aug 2026)',
      time: '10:00 AM - 10:45 AM',
      venue: 'Block A, Room 102',
      status: 'Confirmed',
      instructions: 'Please bring your college ID card, resume copy, and arrive 15 minutes prior.'
    },
    {
      company: 'Microsoft',
      role: 'Cloud Solutions & Software Engineer',
      round: 'Codility Online Challenge',
      date: 'Tomorrow (22 Aug 2026)',
      time: '02:30 PM - 04:00 PM',
      venue: 'Assessment Lab 1 (Reserved Buffer Slot)',
      status: 'Protected from Collision',
      instructions: 'System login credentials will be activated at 02:15 PM.'
    }
  ];

  const toggleDay = (day) => {
    setCompletedPlanDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
    addToast('Action Plan Updated', `Day ${day} progress saved.`, 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Student Portal Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg flex items-center justify-center text-white text-xl font-bold">
            {currentStudent.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                Student Placement Portal
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Status: {currentStudent.placement_status}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-0.5">{currentStudent.name}</h2>
            <p className="text-xs text-slate-300 font-mono">
              ID: {currentStudent.id} &middot; {currentStudent.branch} &middot; CGPA: {currentStudent.cgpa}
            </p>
          </div>
        </div>

        {/* Student Switcher (Allows testing different candidate views) */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="text-right hidden sm:block text-xs">
            <div className="text-slate-400">Switch Student:</div>
          </div>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-xl px-3 py-2 outline-none"
          >
            {students.slice(0, 10).map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id} - {s.branch.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Upcoming Interviews & Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Interview Slots */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              My Upcoming Interview &amp; Test Slots
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Zero Schedule Conflicts
            </span>
          </div>

          <div className="space-y-3.5">
            {studentSchedules.map((slot, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                      {slot.company}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">{slot.role}</h4>
                    <p className="text-xs text-slate-600 font-semibold">{slot.round}</p>
                  </div>

                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    {slot.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="text-[10px] text-slate-400">Date &amp; Time</div>
                      <div className="font-bold text-slate-800">{slot.time} ({slot.date})</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    <DoorOpen className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="text-[10px] text-slate-400">Interview Venue</div>
                      <div className="font-bold text-slate-800">{slot.venue}</div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100">
                  ℹ️ {slot.instructions}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Readiness & Quick Voice Test */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            Candidate Readiness Profile
          </h3>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center space-y-1">
            <div className="text-xs font-semibold text-indigo-900">Software Engineer Readiness</div>
            <div className="text-3xl font-black text-indigo-700">
              {currentStudent.readiness?.overall || 88}%
            </div>
            <div className="text-[11px] text-indigo-600 font-medium">Placement Ready &middot; Verified</div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">DSA Coding Score</span>
              <span className="font-bold text-slate-800">{currentStudent.coding_score}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Aptitude Score</span>
              <span className="font-bold text-slate-800">{currentStudent.aptitude_score}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Communication Score</span>
              <span className="font-bold text-slate-800">{currentStudent.communication_score}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Active Backlogs</span>
              <span className="font-bold text-emerald-700">0 (Zero)</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => triggerVoiceCall(currentStudent.id)}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Simulate AI Voice Call from TPO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Personalized Preparation Plan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              My 5-Day Placement Preparation Roadmap
            </h3>
            <p className="text-xs text-slate-500">Personalized to prepare for tomorrow's Google &amp; Microsoft interviews.</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            {completedPlanDays.length}/5 Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {[
            { day: 1, topic: 'DSA Arrays & Sliding Window', time: '3.5 hrs' },
            { day: 2, topic: 'Dynamic Programming & Graphs', time: '4.0 hrs' },
            { day: 3, topic: 'System Design & Database Caching', time: '3.0 hrs' },
            { day: 4, topic: 'Timed Peer Mock Interview', time: '2.5 hrs' },
            { day: 5, topic: 'STAR HR & Behavioral Stories', time: '2.0 hrs' },
          ].map(p => {
            const isDone = completedPlanDays.includes(p.day);
            return (
              <div
                key={p.day}
                onClick={() => toggleDay(p.day)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 flex flex-col justify-between ${
                  isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className={isDone ? 'text-emerald-700' : 'text-slate-500'}>Day {p.day}</span>
                    <span className="font-mono text-slate-400">{p.time}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 mt-1">{p.topic}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] font-semibold">
                  <span className={isDone ? 'text-emerald-700' : 'text-slate-400'}>
                    {isDone ? 'Completed' : 'Pending'}
                  </span>
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${
                    isDone ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                  }`}>
                    {isDone && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
