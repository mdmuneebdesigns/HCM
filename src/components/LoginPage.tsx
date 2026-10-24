import React, { useState } from 'react';
import { Building2, Lock, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  initialEmail?: string;
  setupSuccessMessage?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialEmail = '', setupSuccessMessage = null }) => {
  const { login, company } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      login(res.token, res.user, res.company);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30 mb-2">
            <Building2 className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {company?.name || 'HCM Lite'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Human Capital Management Portal
          </p>
        </div>

        {setupSuccessMessage && (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{setupSuccessMessage}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-200 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-in fade-in">
            <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Sign in with your administrator, HR, or employee credentials.
          </div>
        </div>

        {company && (
          <div className="text-center text-xs text-slate-400">
            Work Hours: <span className="text-slate-300 font-medium">{company.office_start}</span> (Grace: <span className="text-slate-300 font-medium">{company.grace_period_mins}m</span>) • Weekends: <span className="text-slate-300 font-medium">{company.weekend_days}</span>
          </div>
        )}
      </div>
    </div>
  );
};
