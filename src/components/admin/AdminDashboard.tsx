import React, { useState, useEffect } from 'react';
import { Shield, Building, Umbrella, Users, ShieldAlert, Settings, Calendar, Award, CalendarDays, Inbox, DollarSign, BarChart3 } from 'lucide-react';
import { AdminPoliciesManager } from './AdminPoliciesManager';
import { EmployeeManager } from '../hr/EmployeeManager';
import { AuditLogTable } from '../common/AuditLogTable';
import { HrDailyAttendanceBoard } from '../attendance/HrDailyAttendanceBoard';
import { HrCorrectionInbox } from '../attendance/HrCorrectionInbox';
import { HrAttendanceSummaryCards } from '../attendance/HrAttendanceSummaryCards';
import { PayrollManager } from '../payroll/PayrollManager';
import { AdminAnalyticsDashboard } from '../analytics/AdminAnalyticsDashboard';
import { AnnouncementsBanner } from '../comms/AnnouncementsBanner';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user, company } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'payroll' | 'policies' | 'attendance' | 'corrections' | 'employees' | 'audit'>('analytics');
  const [stats, setStats] = useState({
    departments: 0,
    leaveTypes: 0,
    holidays: 0,
    employees: 0,
  });

  const loadStats = async () => {
    try {
      const [depts, leaves, hols, emps] = await Promise.all([
        api.getDepartments(),
        api.getLeaveTypes(),
        api.getHolidays(),
        api.getEmployees(),
      ]);
      setStats({
        departments: depts.length,
        leaveTypes: leaves.length,
        holidays: hols.length,
        employees: emps.length,
      });
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Announcements */}
      <AnnouncementsBanner />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/50 via-slate-800 to-slate-800 rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              Root Administrator Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {company?.name || 'HCM Lite System'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Configure organizational departments, statutory leave quotas, public holidays, inspect daily attendance, and audit security events.
            </p>
          </div>

          <div className="text-right sm:text-left bg-slate-900/60 p-3 rounded-2xl border border-slate-700/60 text-xs">
            <span className="text-slate-400 block mb-0.5">System Status:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active & Audited
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Departments</span>
            <Building className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.departments}</div>
          <span className="text-[10px] text-slate-400">Configured units</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Leave Policies</span>
            <Umbrella className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{stats.leaveTypes}</div>
          <span className="text-[10px] text-indigo-300">Statutory categories</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Public Holidays</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.holidays}</div>
          <span className="text-[10px] text-slate-400">Statutory holidays</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Employees</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.employees}</div>
          <span className="text-[10px] text-slate-400">Total roster</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Executive Analytics (M7)</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'payroll'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Payroll Lite & Locking (M6)</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'policies'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Policies & Shifts</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Daily Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('corrections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'corrections'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Correction Inbox</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Security Audit Log</span>
        </button>
      </div>

      {/* Active Tab Panel */}
      {activeTab === 'analytics' && <AdminAnalyticsDashboard />}
      {activeTab === 'payroll' && <PayrollManager />}
      {activeTab === 'policies' && <AdminPoliciesManager />}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <HrAttendanceSummaryCards />
          <HrDailyAttendanceBoard />
        </div>
      )}
      {activeTab === 'corrections' && <HrCorrectionInbox />}
      {activeTab === 'employees' && <EmployeeManager />}
      {activeTab === 'audit' && <AuditLogTable />}
    </div>
  );
};
