import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, Umbrella, UserX, Clock, Calendar, RefreshCw } from 'lucide-react';
import { TodayAttendanceSummary } from '../../types';
import { api } from '../../services/api';

export const HrAttendanceSummaryCards: React.FC = () => {
  const [summary, setSummary] = useState<TodayAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await api.getTodaySummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load today attendance summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (!summary) return null;

  const attendanceRate = summary.totalEmployees > 0
    ? Math.round((summary.present / summary.totalEmployees) * 100)
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Today's Live Attendance Overview</h3>
          <span className="text-[11px] text-slate-400 font-mono">({summary.date})</span>
          {summary.holiday && (
            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
              Holiday: {summary.holiday}
            </span>
          )}
          {summary.isWeekend && (
            <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
              Weekend
            </span>
          )}
        </div>

        <button
          onClick={loadSummary}
          disabled={loading}
          className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Refresh summary"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Present */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-emerald-500/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-emerald-400">Present</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{summary.present}</span>
            <span className="text-[11px] text-slate-400">/ {summary.totalEmployees} staff</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">
            {attendanceRate}% Present Today
          </div>
        </div>

        {/* Late */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-amber-500/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-amber-400">Late</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">{summary.late}</span>
            <span className="text-[11px] text-slate-400">arrivals</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Checked in after grace cutoff
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-sky-500/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-sky-400">On Leave</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <Umbrella className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-400 font-mono">{summary.onLeave}</span>
            <span className="text-[11px] text-slate-400">employees</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Approved statutory leave
          </div>
        </div>

        {/* Absent */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-rose-500/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-rose-400">Absent</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">{summary.absent}</span>
            <span className="text-[11px] text-slate-400">unaccounted</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {summary.isWeekend || summary.holiday ? 'Non-working calendar day' : 'No check-in & no leave'}
          </div>
        </div>
      </div>
    </div>
  );
};
