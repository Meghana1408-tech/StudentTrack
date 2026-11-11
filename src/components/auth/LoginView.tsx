import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { User, UserRole } from '../../types/index.ts';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@studenttrack.edu');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (role: UserRole) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.quickLogin(role);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Left Side: Brand and Architecture Overview */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              College PBL Project Demo
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white text-blue-700 flex items-center justify-center shadow-md">
                <i className="bi bi-mortarboard-fill text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight mb-0">StudentTrack</h1>
                <p className="text-blue-200 text-xs font-medium mb-0">Student Tracker System</p>
              </div>
            </div>

            <p className="text-blue-100/90 text-sm leading-relaxed mb-6">
              A comprehensive academic management system built with <strong>Node.js, Express.js, MongoDB (Mongoose)</strong>, and <strong>Chart.js</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <i className="bi bi-shield-check text-blue-300 text-base mt-0.5"></i>
                <div>
                  <span className="font-bold text-white block">Role-Based Access Control (RBAC)</span>
                  <span className="text-blue-200 text-[11px]">Distinct dashboards & APIs for Admin, Faculty, and Students.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <i className="bi bi-calendar2-check text-blue-300 text-base mt-0.5"></i>
                <div>
                  <span className="font-bold text-white block">Automated Attendance Tracking</span>
                  <span className="text-blue-200 text-[11px]">Instant percentage calculations and 75% shortage alerts.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <i className="bi bi-graph-up text-blue-300 text-base mt-0.5"></i>
                <div>
                  <span className="font-bold text-white block">Chart.js Academic Analytics</span>
                  <span className="text-blue-200 text-[11px]">Interactive attendance trends and grade distributions.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/15 text-[11px] text-blue-200 flex items-center justify-between">
            <span>Mongoose 8+ REST APIs</span>
            <span>Bootstrap 5 UI</span>
          </div>
        </div>

        {/* Right Side: Login Form & One-Click Demo Access */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Welcome Back</h2>
            <p className="text-xs text-slate-500">Sign in to your StudentTrack account or test demo roles.</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 text-xs mb-4">
              <i className="bi bi-exclamation-triangle-fill me-1.5"></i> {error}
            </div>
          )}

          {/* Quick Login Role Buttons */}
          <div className="mb-6 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-2">
              ⚡ 1-Click Evaluation Login:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRole('admin')}
                disabled={loading}
                className="btn btn-sm btn-outline-primary bg-white text-xs font-bold py-1.5 rounded-xl shadow-2xs hover:bg-blue-600 hover:text-white"
              >
                <i className="bi bi-shield-lock block text-sm mb-0.5"></i>
                Admin
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('faculty')}
                disabled={loading}
                className="btn btn-sm btn-outline-primary bg-white text-xs font-bold py-1.5 rounded-xl shadow-2xs hover:bg-blue-600 hover:text-white"
              >
                <i className="bi bi-person-video3 block text-sm mb-0.5"></i>
                Faculty
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('student')}
                disabled={loading}
                className="btn btn-sm btn-outline-primary bg-white text-xs font-bold py-1.5 rounded-xl shadow-2xs hover:bg-blue-600 hover:text-white"
              >
                <i className="bi bi-mortarboard block text-sm mb-0.5"></i>
                Student
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase font-semibold">Or sign in with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="form-label text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-slate-50 text-slate-500">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control text-xs"
                  placeholder="name@studenttrack.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-slate-50 text-slate-500">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control text-xs"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-xs font-bold py-2 rounded-xl shadow-xs mt-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                  Authenticating via MongoDB...
                </>
              ) : (
                <>Sign In to Dashboard <i className="bi bi-arrow-right ms-1"></i></>
              )}
            </button>
          </form>

          {/* Test Credentials Footnote */}
          <div className="mt-5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
            <span className="font-bold text-slate-700 block mb-0.5">Test Passwords:</span>
            Admin: <code className="text-blue-700">admin123</code> | Faculty: <code className="text-blue-700">faculty123</code> | Student: <code className="text-blue-700">student123</code>
          </div>
        </div>
      </div>
    </div>
  );
};
