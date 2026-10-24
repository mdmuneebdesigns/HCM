import React, { useEffect, useState } from 'react';
import { Building, Umbrella, Calendar, Clock, RefreshCw } from 'lucide-react';
import { Department, LeaveType, PublicHoliday } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const LeavePoliciesView: React.FC = () => {
  const { company } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(false);
  const [subTab, setSubTab] = useState<'leaves' | 'departments' | 'holidays'>('leaves');

  const loadData = async () => {
    setLoading(true);
    try {
      const [depts, leaves, hols] = await Promise.all([
        api.getDepartments(),
        api.getLeaveTypes(),
        api.getHolidays(),
      ]);
      setDepartments(depts);
      setLeaveTypes(leaves);
      setHolidays(hols);
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-5">
      {/* Policy overview ribbon */}
      {company && (
        <div className="bg-gradient-to-r from-slate-800 to-indigo-950/40 p-4 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Clock className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Company Shift & Attendance Schedule</div>
              <div className="text-xs text-slate-300">
                Official check-in: <span className="font-mono text-indigo-300 font-semibold">{company.office_start}</span> (Grace: <span className="text-amber-300 font-medium">{company.grace_period_mins} min</span>) • Weekend Rest: <span className="text-emerald-300 font-medium">{company.weekend_days}</span>
              </div>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer border border-slate-700"
            title="Refresh policies"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700/80 pb-3">
        <button
          onClick={() => setSubTab('leaves')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            subTab === 'leaves'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Umbrella className="w-3.5 h-3.5" />
          <span>Statutory Leave Quotas ({leaveTypes.length})</span>
        </button>

        <button
          onClick={() => setSubTab('departments')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            subTab === 'departments'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setSubTab('holidays')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            subTab === 'holidays'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Public Holidays ({holidays.length})</span>
        </button>
      </div>

      {/* LEAVES */}
      {subTab === 'leaves' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaveTypes.map((lt) => (
            <div
              key={lt.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-semibold text-white">{lt.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{lt.description || 'Company entitled leave category'}</p>
                </div>
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Umbrella className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between">
                <span className="text-xs text-slate-400">Yearly Quota</span>
                <div>
                  <span className="text-xl font-bold text-indigo-300">{lt.quota_days}</span>
                  <span className="text-[11px] text-slate-400 ml-1">Days / Year</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DEPARTMENTS */}
      {subTab === 'departments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <h4 className="text-base font-semibold text-white">{dept.name}</h4>
                <div className="p-2 bg-slate-700/40 text-slate-300 rounded-xl">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-slate-400">{dept.description || 'Active organizational team'}</p>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Staff:</span>
                <span className="font-semibold text-slate-200">{dept.employee_count ?? 0} members</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HOLIDAYS */}
      {subTab === 'holidays' && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Calendar Date</th>
                  <th className="py-3 px-4">Public Holiday</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {holidays.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No public holidays registered.
                    </td>
                  </tr>
                ) : (
                  holidays.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-indigo-300 whitespace-nowrap">
                        {h.date}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">{h.name}</td>
                      <td className="py-3 px-4 text-slate-400">{h.description || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
