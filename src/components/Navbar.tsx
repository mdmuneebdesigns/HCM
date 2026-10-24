import React, { useState, useEffect } from 'react';
import { Building2, LogOut, KeyRound, Clock, Calendar, Shield, Users, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import { InAppNotification } from '../types';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, company, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkSingleRead = async (id: number) => {
    try {
      const res = await api.markNotificationRead(id);
      setUnreadCount(res.unreadCount);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Shield className="w-3 h-3 text-purple-400" />
            ADMIN
          </span>
        );
      case 'hr':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Users className="w-3 h-3 text-emerald-400" />
            HR MANAGER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <UserIcon className="w-3 h-3 text-sky-400" />
            EMPLOYEE
          </span>
        );
    }
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Company info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                      {company?.name || 'HCM Lite'}
                    </span>
                    <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] uppercase font-mono tracking-wider bg-slate-800 text-indigo-300 border border-slate-700 rounded">
                      HCM Lite
                    </span>
                  </div>
                  {company && (
                    <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Shift: {company.office_start} (Grace: {company.grace_period_mins}m)
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Rest: {company.weekend_days}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Role, Profile & Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {user && (
                <>
                  <div className="hidden sm:block">
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-white leading-tight">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {user.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-xl p-1 relative">
                    {/* Bell Icon with unread badge */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowNotifications(!showNotifications);
                          if (!showNotifications) loadNotifications();
                        }}
                        title="Notifications"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors cursor-pointer relative"
                      >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Notifications Dropdown */}
                      {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
                          <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <Bell className="w-3.5 h-3.5 text-indigo-400" />
                              Notifications
                              {unreadCount > 0 && (
                                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.2 rounded-full">
                                  {unreadCount} unread
                                </span>
                              )}
                            </span>
                            {unreadCount > 0 && (
                              <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>

                          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                            {notifications.length === 0 ? (
                              <div className="p-6 text-center text-slate-400 text-xs">
                                No notifications yet.
                              </div>
                            ) : (
                              notifications.map((n) => (
                                <div
                                  key={n.id}
                                  onClick={() => handleMarkSingleRead(n.id)}
                                  className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                                    n.is_read ? 'bg-slate-900/50 hover:bg-slate-800/40' : 'bg-slate-800/70 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {n.type === 'leave' && <Calendar className="w-4 h-4 text-emerald-400" />}
                                    {n.type === 'correction' && <Clock className="w-4 h-4 text-amber-400" />}
                                    {n.type === 'payslip' && <Building2 className="w-4 h-4 text-indigo-400" />}
                                    {!['leave', 'correction', 'payslip'].includes(n.type) && <Bell className="w-4 h-4 text-slate-400" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className={`font-semibold ${n.is_read ? 'text-slate-300' : 'text-white'}`}>
                                        {n.title}
                                      </span>
                                      {!n.is_read && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                      {n.message}
                                    </p>
                                    <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setShowPasswordModal(true)}
                      title="Change Password"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      onClick={logout}
                      title="Log Out"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          isFirstSignIn={false}
        />
      )}
    </>
  );
};
