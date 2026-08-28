import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  Layers,
  Users,
  DoorOpen,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Tv,
  Wifi,
  Sliders
} from 'lucide-react';

export default function FacilitiesView() {
  const { panels, rooms, openWhyModal } = usePlacement();

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              Module 5 &middot; Infrastructure
            </span>
            <span className="text-xs text-slate-500">Resource &amp; Capacity Optimization</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Interview Panels &amp; Venues Coordination Hub
          </h2>
          <p className="text-xs text-slate-500">
            Maintains interviewer load limits, monitors room equipment, and prevents venue double-booking.
          </p>
        </div>
      </div>

      {/* Grid: Panels & Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Interview Panels */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Interview Panels ({panels.length})
            </h3>
            <span className="text-xs text-slate-500">Max 18 candidates/panel</span>
          </div>

          <div className="space-y-3">
            {panels.map(panel => {
              const isOverloaded = (panel.current_load || 0) >= (panel.max_capacity || 18) * 0.9;
              const isCritical = panel.status === 'Critical' || panel.status === 'Unavailable';

              return (
                <div
                  key={panel.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                    isCritical
                      ? 'bg-rose-50 border-rose-200'
                      : isOverloaded
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <span>{panel.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({panel.company})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{panel.interviewers?.join(', ')}</div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isCritical
                        ? 'bg-rose-600 text-white'
                        : isOverloaded
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {panel.status || 'Active'}
                    </span>
                  </div>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1">
                    {panel.expertise?.map((exp, i) => (
                      <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                        {exp}
                      </span>
                    ))}
                  </div>

                  {/* Load Bar */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 mb-1">
                      <span>Capacity Load: {panel.current_load || 12}/{panel.max_capacity || 18} candidates</span>
                      <span>{Math.round(((panel.current_load || 12) / (panel.max_capacity || 18)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isCritical ? 'bg-rose-500' : isOverloaded ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.round(((panel.current_load || 12) / (panel.max_capacity || 18)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Venue & Room Coordination */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-indigo-600" />
              Interview Rooms &amp; Labs ({rooms.length})
            </h3>
            <span className="text-xs text-slate-500">Zero Double-Booking</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rooms.map(room => (
              <div
                key={room.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900">{room.name}</div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-200">
                    Cap: {room.capacity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{room.location}</div>

                <div className="text-[10px] font-semibold text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                  Assigned: <strong className="text-indigo-700">{room.assigned_panel || 'Panel 1'}</strong>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-emerald-600" /> Gigabit LAN
                  </span>
                  <span className="flex items-center gap-1">
                    <Tv className="w-3 h-3 text-emerald-600" /> Video Conf
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
