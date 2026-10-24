import React, { useEffect, useState } from 'react';
import { Umbrella, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { LeaveRequest } from '../../types';
import { api } from '../../services/api';

export const LeaveReviewManager: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getLeaves();
      setRequests(res.requests);
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      await api.updateLeaveStatus(id, status);
      fetchRequests();
    } catch (err: any) {
      alert('Error updating leave status: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
        <div>
          <h3 className="font-semibold text-white text-base">Employee Leave Requests</h3>
          <p className="text-xs text-slate-400">Review, approve, or reject employee leave applications</p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="p-2 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No leave requests on file.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{req.employee_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{req.employee_code}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                      {req.department_name || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-indigo-300">
                      {req.leave_type_name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      <div>{req.start_date} to {req.end_date}</div>
                      <span className="text-[10px] text-slate-400">{req.days_count} day(s)</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                      {req.reason || <span className="italic text-slate-500">None provided</span>}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'approved')}
                            disabled={processingId === req.id}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            disabled={processingId === req.id}
                            className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          Reviewed by {req.reviewer_name || 'Manager'}
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
  );
};
