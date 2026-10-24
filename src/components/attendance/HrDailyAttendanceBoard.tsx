import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, RefreshCw, CheckCircle2, AlertTriangle, Timer, AlertCircle, Umbrella, Clock } from 'lucide-react';
import { DailyBoardEmployee, Department } from '../../types';
import { api } from '../../services/api';

export const HrDailyAttendanceBoard: React.FC = () => {
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentId, setDepartmentId] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<DailyBoardEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWeekend, setIsWeekend] = useState(false);
  const [holidayName, setHolidayName] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [boardData, depts] = await Promise.all([
        api.getDailyBoard(targetDate, departmentId || undefined),
        api.getDepartments(),
      ]);
      setEmployees(boardData.employees);
      setIsWeekend(boardData.isWeekend);
      setHolidayName(boardData.holiday);
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to load daily attendance board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetDate, departmentId]);

  const filteredEmployees = employees.filter((e) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(term) ||
      e.code.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_time':
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            On Time
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            Late Arrival
          </span>
        );
      case 'half_day':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Timer className="w-3 h-3" />
            Half Day
          </span>
        );
      case 'missing_checkout':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <AlertCircle className="w-3 h-3" />
            Missing Checkout
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Umbrella className="w-3 h-3" />
            On Approved Leave
          </span>
        );
      case 'holiday':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            Holiday
          </span>
        );
      case 'weekend':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Weekend
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Scheduled
          </span>
        );
    }
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff..."
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {holidayName && (
            <span className="text-xs bg-indigo-950/60 text-indigo-300 border border-indigo-900 px-2.5 py-1 rounded-xl">
              Public Holiday: {holidayName}
            </span>
          )}
          {isWeekend && (
            <span className="text-xs bg-slate-900 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-xl">
              Weekend
            </span>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Daily Board Table */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Check-Out Time</th>
                <th className="py-3 px-4">Work Hours</th>
                <th className="py-3 px-4 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    {loading ? 'Loading attendance board...' : 'No employees registered or matching filter.'}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{emp.code}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                      {emp.departmentName}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-white whitespace-nowrap">
                      {formatTime(emp.checkIn)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {formatTime(emp.checkOut)}
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-300 whitespace-nowrap">
                      {emp.workHours > 0 ? `${emp.workHours} hrs` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {getStatusBadge(emp.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
