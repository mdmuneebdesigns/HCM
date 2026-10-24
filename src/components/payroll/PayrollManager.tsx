import React, { useState, useEffect } from 'react';
import { DollarSign, Lock, Unlock, Play, CheckCircle2, AlertCircle, FileText, Search, Download, Calendar, Users, ShieldCheck, RefreshCw } from 'lucide-react';
import { PayrollRun, Payslip } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PayslipModal } from './PayslipModal';

export const PayrollManager: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  // Month input for creating draft (defaults to current month YYYY-MM)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [draftMonth, setDraftMonth] = useState(currentMonth);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const data = await api.getPayrollRuns();
      setRuns(data);
      if (data.length > 0) {
        // Select first run if none selected or if current selection is not in list
        const active = selectedRun ? data.find((r) => r.id === selectedRun.id) || data[0] : data[0];
        setSelectedRun(active);
        await loadRunDetails(active.id);
      } else {
        setSelectedRun(null);
        setPayslips([]);
      }
    } catch (err: any) {
      console.error('Failed to load payroll runs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRunDetails = async (runId: number) => {
    try {
      const details = await api.getPayrollRunDetails(runId);
      setSelectedRun(details.run);
      setPayslips(details.payslips);
    } catch (err: any) {
      console.error('Failed to load payroll run details:', err);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMonth) return;

    setActionLoading(true);
    setNotification(null);
    try {
      const res = await api.createPayrollDraft(draftMonth);
      setNotification({
        type: 'success',
        message: `Payroll draft for ${draftMonth} generated successfully with ${res.payslips.length} employees.`,
      });
      await loadRuns();
      if (res.run) {
        setSelectedRun(res.run);
        setPayslips(res.payslips);
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to create payroll draft.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedRun) return;
    if (!confirm(`Are you sure you want to FINALIZE and LOCK the payroll run for ${selectedRun.month}? Once finalized, no edits or re-runs are permitted.`)) {
      return;
    }

    setActionLoading(true);
    setNotification(null);
    try {
      const res = await api.finalizePayrollRun(selectedRun.id);
      setNotification({
        type: 'success',
        message: res.message || `Payroll run for ${selectedRun.month} has been finalized and locked! Employees have been notified.`,
      });
      await loadRuns();
      await loadRunDetails(selectedRun.id);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to finalize payroll run.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayslips = payslips.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.employee_name?.toLowerCase().includes(q) ||
      p.employee_code?.toLowerCase().includes(q) ||
      p.department_name?.toLowerCase().includes(q) ||
      p.designation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-sm ${
          notification.type === 'success'
            ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-semibold px-2 py-1 rounded-lg hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Action Bar: Create Monthly Draft Run */}
      <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Monthly Payroll Runs (Payroll Lite M6)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Salary structure (Gross = 1.5× Basic, HRA 40%, Medical 10%), working day deductions (Absent, Unpaid Leave, Half Days), and annual tax slabs.
          </p>
        </div>

        <form onSubmit={handleCreateDraft} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-2xl border border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={draftMonth}
              onChange={(e) => setDraftMonth(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
              required
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Run Monthly Draft</span>
          </button>
        </form>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Runs Sidebar List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payroll History</span>
            <span className="text-xs text-slate-400">{runs.length} runs</span>
          </div>

          {runs.length === 0 ? (
            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
              No payroll runs created yet. Select a month above and click "Run Monthly Draft".
            </div>
          ) : (
            <div className="space-y-2">
              {runs.map((r) => {
                const isSelected = selectedRun?.id === r.id;
                const isFinal = r.status === 'finalized';

                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRun(r);
                      loadRunDetails(r.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500/60 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-white">{r.month}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        isFinal
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isFinal ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                        {r.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{r.employee_count} employees</span>
                      <span className="font-semibold text-emerald-400">Net: ${Number(r.total_net).toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Run Details & Payslips */}
        <div className="lg:col-span-3 space-y-4">
          {selectedRun ? (
            <>
              {/* Selected Run Header Banner */}
              <div className="bg-slate-800/70 p-5 rounded-3xl border border-slate-700/80 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">Payroll Run: {selectedRun.month}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                        selectedRun.status === 'finalized'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {selectedRun.status === 'finalized' ? (
                          <>
                            <Lock className="w-3 h-3" />
                            FINALIZED & LOCKED
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            DRAFT STATE
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedRun.status === 'finalized'
                        ? `Finalized by Administrator. Payslips are permanently locked and available to employees.`
                        : `Draft run created. Review deductions and tax before Admin finalization.`}
                    </p>
                  </div>

                  {/* Finalize Button (ONLY Admin can finalize!) */}
                  {selectedRun.status === 'draft' && (
                    <div>
                      {isAdmin ? (
                        <button
                          onClick={handleFinalize}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Finalize & Lock Payroll</span>
                        </button>
                      ) : (
                        <div className="text-xs px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-amber-400 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Admin authorization required to finalize</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* KPI Metrics for this run */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Headcount</span>
                    <span className="text-lg font-bold text-white">{selectedRun.employee_count} Employees</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Gross</span>
                    <span className="text-lg font-bold text-indigo-400">${Number(selectedRun.total_gross).toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Net Pay</span>
                    <span className="text-lg font-bold text-emerald-400">${Number(selectedRun.total_net).toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Taxes & Deds</span>
                    <span className="text-lg font-bold text-rose-400">
                      ${Math.max(0, Number(selectedRun.total_gross) - Number(selectedRun.total_net)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search filter */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employee by name, code, department..."
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <span className="text-xs text-slate-400">{filteredPayslips.length} payslips</span>
              </div>

              {/* Payslips Table */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/70 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/70 text-slate-400 uppercase font-semibold border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-3 py-3">Department</th>
                        <th className="px-3 py-3">Basic</th>
                        <th className="px-3 py-3">Gross</th>
                        <th className="px-3 py-3">Working/Attended</th>
                        <th className="px-3 py-3">Deductions</th>
                        <th className="px-3 py-3">Tax</th>
                        <th className="px-3 py-3">Net Salary</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredPayslips.map((ps) => (
                        <tr key={ps.id} className="hover:bg-slate-800/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{ps.employee_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{ps.employee_code}</div>
                          </td>
                          <td className="px-3 py-3 text-slate-300">{ps.department_name || 'General'}</td>
                          <td className="px-3 py-3 text-slate-300">${Number(ps.basic_salary).toLocaleString()}</td>
                          <td className="px-3 py-3 font-semibold text-indigo-300">${Number(ps.gross).toLocaleString()}</td>
                          <td className="px-3 py-3">
                            <span className="text-white font-medium">{ps.attended_days}</span>
                            <span className="text-slate-500"> / {ps.working_days}d</span>
                            {ps.absent_days > 0 && (
                              <span className="ml-1 text-[10px] text-rose-400 font-semibold">({ps.absent_days} abs)</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-rose-400 font-medium">
                            {ps.total_deductions > 0 ? `-$${Number(ps.total_deductions).toLocaleString()}` : '$0'}
                          </td>
                          <td className="px-3 py-3 text-amber-400 font-medium">
                            {ps.monthly_tax > 0 ? `-$${Number(ps.monthly_tax).toLocaleString()}` : '$0'}
                          </td>
                          <td className="px-3 py-3 font-bold text-emerald-400 text-sm">
                            ${Number(ps.net_salary).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedPayslip(ps);
                                setIsPayslipModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View / PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800/40 p-12 rounded-3xl border border-slate-800 text-center text-slate-400 space-y-2">
              <DollarSign className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-base font-semibold text-white">No Payroll Run Selected</div>
              <p className="text-xs max-w-sm mx-auto">
                Create a new draft payroll run using the month selector above to compute salaries and tax slabs.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payslip Modal with PDF generation */}
      <PayslipModal
        payslip={selectedPayslip}
        isOpen={isPayslipModalOpen}
        onClose={() => {
          setIsPayslipModalOpen(false);
          setSelectedPayslip(null);
        }}
      />
    </div>
  );
};
