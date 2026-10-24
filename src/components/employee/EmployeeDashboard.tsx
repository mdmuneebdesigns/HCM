import React, { useEffect, useState } from 'react';
import { User, Building, Calendar, DollarSign, Clock, Umbrella, Plus, Send, CheckCircle2, AlertCircle, RefreshCw, X, CalendarDays, FileEdit, Award, Target, FileText } from 'lucide-react';
import { LeaveBalance, LeaveRequest, LeaveType, PublicHoliday, EmployeeAnalyticsData } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AttendancePunchCard } from '../attendance/AttendancePunchCard';
import { AttendanceCalendar } from '../attendance/AttendanceCalendar';
import { EmployeePayslipsView } from './EmployeePayslipsView';
import { AnnouncementsBanner } from '../comms/AnnouncementsBanner';

export const EmployeeDashboard: React.FC = () => {
  const { user, company } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'payslips' | 'leaves' | 'profile' | 'holidays'>('attendance');
  const [analytics, setAnalytics] = useState<EmployeeAnalyticsData | null>(null);

  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(false);

  // Leave submission modal
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [daysCount, setDaysCount] = useState<number>(1);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leaveData, types, hols, analyticsData] = await Promise.all([
        api.getLeaves(), // Scoped on server to current employee!
        api.getLeaveTypes(),
        api.getHolidays(),
        api.getEmployeeAnalytics().catch(() => null),
      ]);
      setRequests(leaveData.requests);
      setBalances(leaveData.balances || []);
      setLeaveTypes(types);
      setHolidays(hols);
      if (analyticsData) {
        setAnalytics(analyticsData);
      }
      if (types.length > 0 && selectedLeaveType === '') {
        setSelectedLeaveType(types[0].id);
      }
    } catch (err) {
      console.error('Failed to load employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);

    if (!selectedLeaveType || !startDate || !endDate || daysCount <= 0) {
      setApplyError('Please fill in all leave request parameters.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitLeave({
        leave_type_id: Number(selectedLeaveType),
        start_date: startDate,
        end_date: endDate,
        days_count: Number(daysCount),
        reason: reason.trim(),
      });

      setApplySuccess(true);
      setTimeout(() => {
        setIsApplyOpen(false);
        setApplySuccess(false);
        setReason('');
        loadData();
      }, 1500);
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Announcements */}
      <AnnouncementsBanner />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-800 to-slate-800 rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Employee Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Punch daily check-in / check-out, monitor attendance calendar, apply for statutory leave, review finalized payslips, and check company announcements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApplyOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Dashboard KPIs (M7) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Hours Worked This Week vs 40h target */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Weekly Work Hours</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">
              {analytics?.hoursWorkedThisWeek ?? 0}h
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 40h Target</span>
          </div>
          {/* Visual Progress bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, (((analytics?.hoursWorkedThisWeek ?? 0) / 40) * 100))}%` }}
              className="bg-indigo-500 h-full rounded-full transition-all"
            />
          </div>
        </div>

        {/* Late count this month */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Late This Month</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {analytics?.lateCountThisMonth ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">After 09:15 cutoff</span>
        </div>

        {/* Leave Balance per type */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Available Leave</span>
            <Umbrella className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {balances.reduce((acc, b) => acc + b.remaining, 0)} Days
          </div>
          <span className="text-[10px] text-slate-400">
            {balances.map((b) => `${b.name.split(' ')[0]}: ${b.remaining}`).join(' • ')}
          </span>
        </div>

        {/* Last Payslip Amount */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Last Payslip</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white truncate">
            {analytics?.lastPayslip
              ? `$${Number(analytics.lastPayslip.net_salary).toLocaleString()}`
              : 'Pending'}
          </div>
          <span className="text-[10px] text-slate-400">
            {analytics?.lastPayslip ? `Net for ${analytics.lastPayslip.month}` : 'No finalized runs yet'}
          </span>
        </div>
      </div>

      {/* 1. Daily Attendance Punch Card (Server-verified time clock) */}
      <AttendancePunchCard company={company} onAttendanceUpdated={loadData} />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Attendance Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('payslips')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'payslips'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Payslips & PDF (M6)</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'leaves'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Umbrella className="w-4 h-4" />
          <span>Leave Entitlements & Requests</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Employment Record</span>
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'holidays'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Public Holidays</span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE CALENDAR */}
      {activeTab === 'attendance' && (
        <AttendanceCalendar />
      )}

      {/* TAB: MY PAYSLIPS & PDF DOWNLOAD */}
      {activeTab === 'payslips' && (
        <EmployeePayslipsView />
      )}

      {/* TAB 2: LEAVES */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Leave Quotas Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Umbrella className="w-5 h-5 text-indigo-400" />
                <span>My Statutory Leave Quotas (Yearly)</span>
              </h3>
              <span className="text-xs text-slate-400">Annual • Sick • Casual</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{b.name}</span>
                    <span className="text-xs text-indigo-300 font-mono font-bold bg-indigo-950/60 border border-indigo-900 px-2 py-0.5 rounded-full">
                      {b.remaining} days left
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (b.used / b.quota) * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Total Quota: <strong className="text-slate-200">{b.quota}d</strong></span>
                    <span>Used: <strong className="text-slate-200">{b.used}d</strong></span>
                    <span>Pending: <strong className="text-amber-400">{b.pending}d</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">My Leave Application History</h3>
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Days</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          You have not submitted any leave requests yet.
                        </td>
                      </tr>
                    ) : (
                      requests.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                            {r.leave_type_name}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                            {r.start_date} → {r.end_date}
                          </td>
                          <td className="py-3 px-4 font-bold text-indigo-300">
                            {r.days_count}d
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                            {r.reason || '—'}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {r.status === 'approved' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                Approved
                              </span>
                            )}
                            {r.status === 'rejected' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                Rejected
                              </span>
                            )}
                            {r.status === 'pending' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMPLOYMENT RECORD */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 shadow-xl space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white text-base">My Employment Profile</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-lg">
                {user?.employeeCode || 'EMP-SELF'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block mb-1">Official Name</span>
                <span className="text-sm font-semibold text-white">{user?.name}</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block mb-1">Assigned Department</span>
                <span className="text-sm font-semibold text-indigo-300">{user?.departmentName || 'General Staff'}</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block mb-1">Work Email</span>
                <span className="text-sm font-mono text-slate-200">{user?.email}</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block mb-1">Date of Joining</span>
                <span className="text-sm font-mono text-slate-200">{user?.joinDate || 'N/A'}</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block mb-1">Basic Monthly Salary</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  ${Number(user?.basicSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block mb-1">Designation</span>
                <span className="text-sm font-semibold text-slate-200">{user?.designation || 'Staff Member'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-white text-base">Office Schedule</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-1">
                <span className="text-slate-400 block">Shift Timing:</span>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{company?.office_start || '09:00'} Standard</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-1">
                <span className="text-slate-400 block">Arrival Grace Period:</span>
                <div className="text-sm font-bold text-amber-300">
                  {company?.grace_period_mins || 15} minutes allowed
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-1">
                <span className="text-slate-400 block">Weekend Rest Days:</span>
                <div className="text-sm font-semibold text-emerald-400">
                  {company?.weekend_days || 'Saturday, Sunday'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PUBLIC HOLIDAYS */}
      {activeTab === 'holidays' && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-base">Company Public Holidays Schedule</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {holidays.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center col-span-2">No public holidays scheduled yet.</p>
            ) : (
              holidays.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-semibold text-white block">{h.name}</span>
                    <span className="text-xs text-slate-400">{h.description || 'Statutory Non-working Day'}</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-indigo-300 bg-indigo-950/40 border border-indigo-900 px-2.5 py-1 rounded-lg">
                    {h.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* APPLY FOR LEAVE MODAL */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
              <div className="flex items-center gap-2">
                <Umbrella className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Apply for Leave</h3>
              </div>
              <button
                onClick={() => setIsApplyOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyError && (
              <div className="mb-4 bg-rose-950/60 border border-rose-800 text-rose-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            {applySuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-semibold text-white">Application Submitted!</h4>
                <p className="text-xs text-slate-400">Your leave request has been sent to HR for review.</p>
              </div>
            ) : (
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Leave Category</label>
                  <select
                    value={selectedLeaveType}
                    onChange={(e) => setSelectedLeaveType(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    {leaveTypes.map((lt) => (
                      <option key={lt.id} value={lt.id}>
                        {lt.name} ({lt.quota_days} days yearly quota)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Working Days Requested</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={daysCount}
                    onChange={(e) => setDaysCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Reason (Optional)</label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Brief explanation for time-off..."
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsApplyOpen(false)}
                    className="px-4 py-2 bg-slate-700 text-slate-300 text-xs rounded-xl hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
