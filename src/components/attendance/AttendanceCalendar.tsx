import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileEdit, Clock, CheckCircle2, AlertTriangle, AlertCircle, Timer, Umbrella, RefreshCw } from 'lucide-react';
import { AttendanceCalendarDay } from '../../types';
import { api } from '../../services/api';
import { AttendanceCorrectionModal } from './AttendanceCorrectionModal';

export const AttendanceCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<AttendanceCalendarDay[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Correction modal
  const [correctionDate, setCorrectionDate] = useState<string | undefined>(undefined);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const loadMonthData = async () => {
    setLoading(true);
    try {
      const data = await api.getMyMonthlyAttendance(monthStr);
      setCalendarDays(data.days);
      setSummary(data.summary || {});
    } catch (err) {
      console.error('Failed to load monthly attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonthData();
  }, [monthStr]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleOpenCorrection = (date?: string) => {
    setCorrectionDate(date);
    setIsCorrectionOpen(true);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get status color styling
  const getStatusStyling = (status: string) => {
    switch (status) {
      case 'on_time':
      case 'present':
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          label: 'On Time',
          dot: 'bg-emerald-400',
        };
      case 'late':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          label: 'Late',
          dot: 'bg-amber-400',
        };
      case 'half_day':
        return {
          badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          label: 'Half Day',
          dot: 'bg-purple-400',
        };
      case 'missing_checkout':
        return {
          badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          label: 'Missing Out',
          dot: 'bg-orange-400',
        };
      case 'absent':
        return {
          badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          label: 'Absent',
          dot: 'bg-rose-400',
        };
      case 'on_leave':
        return {
          badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          label: 'On Leave',
          dot: 'bg-sky-400',
        };
      case 'holiday':
        return {
          badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          label: 'Holiday',
          dot: 'bg-indigo-400',
        };
      case 'weekend':
        return {
          badge: 'bg-slate-800 text-slate-500 border-slate-700/50',
          label: 'Weekend',
          dot: 'bg-slate-600',
        };
      default:
        return {
          badge: 'bg-slate-800/40 text-slate-500 border-slate-700/30',
          label: 'Upcoming',
          dot: 'bg-slate-700',
        };
    }
  };

  // Find day of week for the 1st of month to compute leading empty cells (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="space-y-4">
      {/* Month Navigation & Action Bar */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-4 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-xs font-semibold text-white whitespace-nowrap">
              {monthName}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={loadMonthData}
            disabled={loading}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button
          onClick={() => handleOpenCorrection()}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <FileEdit className="w-4 h-4" />
          <span>Request Attendance Correction</span>
        </button>
      </div>

      {/* Monthly Summary Statistics Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400">On Time</span>
          <span className="font-bold text-emerald-400 font-mono">{summary.present || 0}</span>
        </div>
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400">Late</span>
          <span className="font-bold text-amber-400 font-mono">{summary.late || 0}</span>
        </div>
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400">Half Day</span>
          <span className="font-bold text-purple-400 font-mono">{summary.half_day || 0}</span>
        </div>
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400">On Leave</span>
          <span className="font-bold text-sky-400 font-mono">{summary.on_leave || 0}</span>
        </div>
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400">Absent</span>
          <span className="font-bold text-rose-400 font-mono">{summary.absent || 0}</span>
        </div>
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400">Hours</span>
          <span className="font-bold text-indigo-300 font-mono">{summary.total_work_hours || 0}h</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-4 shadow-xl">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-700/60 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Leading empty slots */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[85px] bg-slate-900/30 rounded-xl border border-slate-800/30" />
          ))}

          {/* Days */}
          {calendarDays.map((d) => {
            const styling = getStatusStyling(d.status);
            const isToday = d.date === new Date().toISOString().split('T')[0];

            return (
              <div
                key={d.date}
                className={`min-h-[85px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                  isToday
                    ? 'bg-slate-800 border-indigo-500 shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isToday ? 'text-indigo-400' : 'text-slate-300'
                    }`}
                  >
                    {d.dayNumber}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${styling.dot}`} />
                </div>

                <div className="my-1">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${styling.badge}`}
                  >
                    {styling.label}
                  </span>

                  {d.checkIn && (
                    <div className="text-[10px] font-mono text-slate-300 mt-1">
                      In: {d.checkIn.slice(11, 16)}
                      {d.checkOut && ` • Out: ${d.checkOut.slice(11, 16)}`}
                    </div>
                  )}

                  {d.workHours > 0 && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      {d.workHours} hrs
                    </div>
                  )}

                  {d.holidayName && (
                    <div className="text-[10px] text-indigo-300 truncate font-medium">
                      {d.holidayName}
                    </div>
                  )}

                  {d.leaveInfo && (
                    <div className="text-[10px] text-sky-300 truncate font-medium">
                      {d.leaveInfo}
                    </div>
                  )}
                </div>

                {/* Correction trigger button for past days with issues */}
                {d.date < new Date().toISOString().split('T')[0] && (d.status === 'absent' || d.status === 'missing_checkout' || d.status === 'late') && (
                  <button
                    onClick={() => handleOpenCorrection(d.date)}
                    className="text-[9px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <FileEdit className="w-2.5 h-2.5" />
                    <span>Correct</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Correction Modal */}
      <AttendanceCorrectionModal
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
        initialDate={correctionDate}
        onCorrectionSubmitted={loadMonthData}
      />
    </div>
  );
};
