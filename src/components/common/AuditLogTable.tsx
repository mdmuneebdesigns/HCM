import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, Filter, Clock, Globe, UserCheck, ChevronDown, ChevronRight } from 'lucide-react';
import { AuditLog } from '../../types';
import { api } from '../../services/api';

export const AuditLogTable: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs({
        entity: entityFilter || undefined,
        action: actionFilter || undefined,
        limit: 150,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes('INITIAL') || action.includes('REGISTER') || action.includes('CREATE')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('DELETE') || action.includes('REJECT')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    if (action.includes('UPDATE') || action.includes('PASSWORD')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white text-sm sm:text-base">System Audit Trail</h3>
          <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
            {logs.length} events
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Entity filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Entities</option>
            <option value="company">Company</option>
            <option value="employee">Employee</option>
            <option value="user">User</option>
            <option value="department">Department</option>
            <option value="leave_type">Leave Type</option>
            <option value="holiday">Holiday</option>
            <option value="leave_request">Leave Request</option>
          </select>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  let parsedDetails: any = null;
                  if (log.details) {
                    try {
                      parsedDetails = JSON.parse(log.details);
                    } catch {
                      parsedDetails = log.details;
                    }
                  }

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-700/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase border tracking-wider ${getActionBadge(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 capitalize">
                          {log.entity} {log.entity_id ? `#${log.entity_id}` : ''}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-200">{log.actor_name || 'System'}</div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                            {log.actor_role || 'system'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {parsedDetails ? (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : log.id)}
                              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-mono text-[11px] cursor-pointer"
                            >
                              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                            </button>
                          ) : (
                            <span className="text-slate-500 italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                          {log.ip_address || '—'}
                        </td>
                      </tr>
                      {isExpanded && parsedDetails && (
                        <tr className="bg-slate-900/90">
                          <td colSpan={6} className="py-3 px-6">
                            <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto max-h-48">
                              {typeof parsedDetails === 'string'
                                ? parsedDetails
                                : JSON.stringify(parsedDetails, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
