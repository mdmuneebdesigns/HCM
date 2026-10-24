import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Clock, AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck, Timer } from 'lucide-react';
import { AttendanceRecord, Company } from '../../types';
import { api } from '../../services/api';

interface AttendancePunchCardProps {
  company: Company | null;
  onAttendanceUpdated?: () => void;
}

export const AttendancePunchCard: React.FC<AttendancePunchCardProps> = ({ company, onAttendanceUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const fetchTodayStatus = async () => {
    try {
      const data = await api.getTodayAttendance();
      setCheckedIn(data.checkedIn);
      setCheckedOut(data.checkedOut);
      setTodayRecord(data.record);
    } catch (err) {
      console.error('Failed to fetch today attendance:', err);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.checkIn();
      setCheckedIn(true);
      setTodayRecord(res.attendance);
      setMessage({ text: res.message, type: res.attendance.status === 'late' ? 'warning' : 'success' });
      if (onAttendanceUpdated) onAttendanceUpdated();
    } catch (err: any) {
      // Handles HTTP 409 Conflict (second check-in on the same day)
      setMessage({ text: err.message || 'Check-in failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.checkOut();
      setCheckedOut(true);
      setTodayRecord(res.attendance);
      setMessage({ text: res.message, type: 'success' });
      if (onAttendanceUpdated) onAttendanceUpdated();
    } catch (err: any) {
      setMessage({ text: err.message || 'Check-out failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'on_time':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            On Time
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Late Arrival
          </span>
        );
      case 'half_day':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Timer className="w-3.5 h-3.5" />
            Half Day (&lt;5 hrs)
          </span>
        );
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Present (Active)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Today's Attendance Punch</h3>
            <p className="text-xs text-slate-400">
              Server-verified timestamp • Shift starts at {company?.office_start || '09:00'} (Grace: {company?.grace_period_mins || 15}m)
            </p>
          </div>
        </div>

        {todayRecord && getStatusBadge(todayRecord.status)}
      </div>

      {/* Notification banner */}
      {message && (
        <div
          className={`px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800'
              : message.type === 'warning'
              ? 'bg-amber-950/60 text-amber-200 border-amber-800'
              : 'bg-rose-950/60 text-rose-200 border-rose-800'
          }`}
        >
          {message.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          ) : message.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Punch Action Buttons & Status Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Check-In Card */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Morning Check-In</span>
            <LogIn className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">
              {formatTime(todayRecord?.check_in)}
            </div>
            <span className="text-[11px] text-slate-400">
              Cutoff: 09:15 AM (09:00 + {company?.grace_period_mins || 15}m grace)
            </span>
          </div>

          <button
            type="button"
            onClick={handleCheckIn}
            disabled={loading || checkedIn}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              checkedIn
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 cursor-not-allowed opacity-80'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{checkedIn ? 'Check-In Recorded' : 'Check In Now'}</span>
          </button>
        </div>

        {/* Check-Out Card */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Evening Check-Out</span>
            <LogOut className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">
              {formatTime(todayRecord?.check_out)}
            </div>
            <span className="text-[11px] text-slate-400">
              Total Duration: {todayRecord?.work_hours ? `${todayRecord.work_hours} hrs` : 'In Progress'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCheckOut}
            disabled={loading || !checkedIn || checkedOut}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !checkedIn
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : checkedOut
                ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-800/60 cursor-not-allowed opacity-80'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>
              {!checkedIn
                ? 'Check In First'
                : checkedOut
                ? 'Check-Out Recorded'
                : 'Check Out Now'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
