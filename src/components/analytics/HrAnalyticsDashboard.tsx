import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Clock, AlertCircle, TrendingUp, BarChart3, Building, Award, RefreshCw, Filter } from 'lucide-react';
import { HrAnalyticsData, Department } from '../../types';
import { api } from '../../services/api';

export const HrAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<HrAnalyticsData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analytics, depts] = await Promise.all([
        api.getHrAnalytics({
          department_id: selectedDept ? Number(selectedDept) : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }),
        api.getDepartments(),
      ]);
      setData(analytics);
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to load HR analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, startDate, endDate]);

  if (!data && loading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
        <span className="text-sm font-medium">Computing HR Analytics & Attendance Rates...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {
    headcount: 0,
    presentToday: 0,
    onLeaveToday: 0,
    lateToday: 0,
    pendingApprovals: 0,
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Analytics Scope</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            />
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5 Core HR KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Headcount</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{kpis.headcount}</div>
          <span className="text-[10px] text-slate-400">Active roster</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Present Today</span>
            <UserCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{kpis.presentToday}</div>
          <span className="text-[10px] text-slate-400">Clocked in</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">On Leave Today</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{kpis.onLeaveToday}</div>
          <span className="text-[10px] text-slate-400">Approved leaves</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Late Today</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{kpis.lateToday}</div>
          <span className="text-[10px] text-slate-400">After 09:15 cutoff</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Approvals</span>
            <AlertCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{kpis.pendingApprovals}</div>
          <span className="text-[10px] text-slate-400">Leaves & Corrections</span>
        </div>
      </div>

      {/* Attendance Trend (Last 30 Days) using Official Formula */}
      <div className="bg-slate-800/70 p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Attendance Trend (Last 30 Working Days)
            </h3>
            <p className="text-xs text-slate-400">
              Computed daily using: <code className="text-emerald-300 font-mono text-[11px]">(present + late + missing_checkout + 0.5×half_day) ÷ (working_records − on_leave)</code>
            </p>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="flex items-end gap-1.5 h-44 overflow-x-auto pb-2">
            {(data?.attendanceTrend || []).map((t) => {
              const heightPct = Math.max(8, Math.min(100, t.rate));
              return (
                <div key={t.date} className="flex-1 min-w-[24px] flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-slate-900 border border-slate-700 text-[10px] text-white p-2 rounded-xl shadow-xl whitespace-nowrap">
                      <div className="font-bold text-emerald-400">{t.date}: {t.rate}%</div>
                      <div>Present: {t.present} | Late: {t.late}</div>
                      <div>Half-Day: {t.half_day} | On Leave: {t.on_leave}</div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-900/60 rounded-t-lg h-36 flex items-end p-0.5">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        t.rate >= 85
                          ? 'bg-emerald-500 group-hover:bg-emerald-400'
                          : t.rate >= 70
                          ? 'bg-amber-500 group-hover:bg-amber-400'
                          : 'bg-rose-500 group-hover:bg-rose-400'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono transform -rotate-45 origin-top-left mt-1">
                    {t.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Absenteeism by Dept & Top Late-Comers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absenteeism by Department: absent days ÷ expected working days */}
        <div className="bg-slate-800/70 p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-rose-400" />
            Absenteeism by Department (This Month)
          </h3>
          <p className="text-xs text-slate-400">
            Formula: <code className="text-rose-300 font-mono text-[11px]">absent days ÷ expected working days</code>
          </p>

          <div className="space-y-3 pt-2">
            {(data?.absenteeismByDepartment || []).map((dept) => (
              <div key={dept.departmentId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">{dept.departmentName}</span>
                  <span className="text-rose-400 font-bold">
                    {dept.absenteeismRate}% ({dept.absentDays} / {dept.expectedWorkingDays} days)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, dept.absenteeismRate)}%` }}
                    className="bg-rose-500 h-full rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Late-Comers This Month */}
        <div className="bg-slate-800/70 p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Top 5 Late-Comers This Month (Most Late Days)
          </h3>
          <p className="text-xs text-slate-400">Employees with the highest number of post-09:15 arrivals this month.</p>

          <div className="space-y-2 pt-2">
            {(data?.topLateComers || []).length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No late arrivals recorded this month!</div>
            ) : (
              (data?.topLateComers || []).map((emp, index) => (
                <div
                  key={emp.employee_id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-xs text-white">{emp.employee_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {emp.employee_code} • {emp.department_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {emp.late_count} Late Days
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Leave Utilization per Type per Department */}
      <div className="bg-slate-800/70 p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" />
          Leave Utilization per Type (Approved Days ÷ Quota)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/70 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Quota per Person</th>
                <th className="px-4 py-3">Department Quota</th>
                <th className="px-4 py-3">Approved Days</th>
                <th className="px-4 py-3 text-right">Utilization Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(data?.leaveUtilization || []).map((lu, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50">
                  <td className="px-4 py-2.5 font-semibold text-white">{lu.departmentName}</td>
                  <td className="px-4 py-2.5 text-indigo-300 font-medium">{lu.leaveTypeName}</td>
                  <td className="px-4 py-2.5 text-slate-400">{lu.quotaDays} days</td>
                  <td className="px-4 py-2.5 text-slate-400">{lu.totalQuota} days</td>
                  <td className="px-4 py-2.5 font-semibold text-amber-400">{lu.approvedDays} days</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {lu.utilizationRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
