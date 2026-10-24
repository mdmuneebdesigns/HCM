import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Download, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';
import { Payslip } from '../../types';
import { api } from '../../services/api';
import { PayslipModal } from '../payroll/PayslipModal';

export const EmployeePayslipsView: React.FC = () => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPayslips = async () => {
    setLoading(true);
    try {
      const data = await api.getMyPayslips();
      setPayslips(data);
    } catch (err) {
      console.error('Failed to load payslips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayslips();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            My Salary Payslips
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access, view breakdown, and download PDF copies of your finalized monthly payslips.
          </p>
        </div>

        <button
          onClick={loadPayslips}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
          <span className="text-xs font-medium">Loading your payslips...</span>
        </div>
      ) : payslips.length === 0 ? (
        <div className="bg-slate-800/40 p-12 rounded-3xl border border-slate-800 text-center text-slate-400 space-y-2">
          <FileText className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="text-base font-semibold text-white">No Finalized Payslips Yet</div>
          <p className="text-xs max-w-sm mx-auto">
            Once monthly payroll is processed and finalized by the Administrator, your payslips and PDF downloads will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payslips.map((ps) => (
            <div
              key={ps.id}
              className="bg-slate-800/70 p-5 rounded-3xl border border-slate-700/80 shadow-lg hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    {ps.month}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    FINALIZED
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Working / Attended:</span>
                    <span className="font-semibold text-white">{ps.attended_days} / {ps.working_days} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Earnings:</span>
                    <span className="font-semibold text-indigo-300">${Number(ps.gross).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deductions & Tax:</span>
                    <span className="font-semibold text-rose-400">
                      -${Number(ps.total_deductions + ps.monthly_tax).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">Net Salary</span>
                  <div className="text-2xl font-extrabold text-white mt-0.5">
                    ${Number(ps.net_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPayslip(ps);
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View & Download PDF</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PDF View Modal */}
      <PayslipModal
        payslip={selectedPayslip}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayslip(null);
        }}
      />
    </div>
  );
};
