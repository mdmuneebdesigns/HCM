import React, { useState, useEffect } from 'react';
import { Users, TrendingDown, DollarSign, Wallet, Building, ShieldAlert, RefreshCw, Filter } from 'lucide-react';
import { AdminAnalyticsData, Department } from '../../types';
import { api } from '../../services/api';

export const AdminAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analytics, depts] = await Promise.all([
        api.getAdminAnalytics({
          department_id: selectedDept ? Number(selectedDept) : undefined,
        }),
        api.getDepartments(),
      ]);
      setData(analytics);
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  if (!data && loading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
        <span className="text-sm font-medium">Computing Admin Executive Metrics & Payroll Costs...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {
    headcount: 0,
    attritionRate: 0,
    payrollCostGross: 0,
    payrollCostNet: 0,
    averageSalary: 0,
    latestPayrollMonth: null,
    latestPayrollStatus: null,
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Executive Scope</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Organization Units</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Core Executive Admin KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Headcount */}
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Headcount</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{kpis.headcount}</div>
          <span className="text-[10px] text-slate-400">Active personnel</span>
        </div>

        {/* Attrition (exits ÷ average headcount × 100) */}
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Attrition Rate</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{kpis.attritionRate}%</div>
          <span className="text-[10px] text-slate-400">Exits ÷ Avg Headcount × 100</span>
        </div>

        {/* Payroll Cost (sum of Gross AND Net) */}
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Payroll Cost ({kpis.latestPayrollMonth || 'Latest'})</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            ${kpis.payrollCostGross.toLocaleString()} <span className="text-xs font-normal text-slate-400">Gross</span>
          </div>
          <span className="text-[11px] text-slate-300 font-semibold block">
            Net: ${kpis.payrollCostNet.toLocaleString()}
          </span>
        </div>

        {/* Average Salary */}
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Average Salary (Gross)</span>
            <Wallet className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${kpis.averageSalary.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">1.5 × Basic avg</span>
        </div>
      </div>

      {/* Headcount by Department & Payroll Cost by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount by Department */}
        <div className="bg-slate-800/70 p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            Headcount by Department
          </h3>

          <div className="space-y-3">
            {(data?.headcountByDepartment || []).map((dept) => {
              const maxCount = Math.max(1, ...data!.headcountByDepartment.map((d) => d.headcount));
              const pct = (dept.headcount / maxCount) * 100;

              return (
                <div key={dept.department_id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{dept.department_name}</span>
                    <span className="text-purple-300 font-bold">{dept.headcount} Staff</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-purple-500 h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payroll Cost by Department */}
        <div className="bg-slate-800/70 p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Payroll Cost by Department (Gross & Net)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/70 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="px-3 py-2.5">Department</th>
                  <th className="px-3 py-2.5">Staff</th>
                  <th className="px-3 py-2.5">Gross Cost</th>
                  <th className="px-3 py-2.5 text-right">Net Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(data?.payrollCostByDepartment || []).map((dept) => (
                  <tr key={dept.departmentId} className="hover:bg-slate-800/50">
                    <td className="px-3 py-2.5 font-semibold text-white">{dept.departmentName}</td>
                    <td className="px-3 py-2.5 text-slate-300">{dept.headcount}</td>
                    <td className="px-3 py-2.5 font-bold text-indigo-400">${dept.grossCost.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-emerald-400">${dept.netCost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Feed of Recent Actions */}
      <div className="bg-slate-800/70 p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Recent Audit Feed
        </h3>

        <div className="divide-y divide-slate-800 text-xs">
          {(data?.auditFeed || []).map((log) => (
            <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                  {log.action}
                </span>
                <span className="font-semibold text-white">{log.actor_name || 'System'}</span>
                <span className="text-slate-400">({log.actor_role})</span>
                <span className="text-slate-400">• {log.entity} #{log.entity_id}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
