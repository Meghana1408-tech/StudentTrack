import React, { useState } from 'react';
import { User, UserRole } from '../types/index.ts';

interface NavbarProps {
  currentUser: User | null;
  onQuickLogin: (role: UserRole) => Promise<void>;
  onLogout: () => void;
  onResetDatabase: () => Promise<void>;
  toggleSidebar: () => void;
  onOpenReportCard: (rollNo: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onQuickLogin,
  onLogout,
  onResetDatabase,
  toggleSidebar,
  onOpenReportCard,
}) => {
  const [resetting, setResetting] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const handleRoleSwitch = async (role: UserRole) => {
    try {
      setSwitching(role);
      await onQuickLogin(role);
    } finally {
      setSwitching(null);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset and re-seed the MongoDB database with default college demo data?')) {
      try {
        setResetting(true);
        await onResetDatabase();
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <header className="sticky-top bg-white border-bottom border-slate-200 shadow-xs z-40">
      <div className="container-fluid px-3 px-lg-4 py-2.5">
        <div className="d-flex align-items-center justify-content-between gap-2">
          {/* Brand & Mobile Hamburger */}
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="btn btn-sm btn-light border d-lg-none d-flex align-items-center justify-content-center p-2 rounded-lg"
              title="Toggle Navigation"
            >
              <i className="bi bi-list text-lg"></i>
            </button>

            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary text-white p-2 rounded-xl d-flex align-items-center justify-content-center shadow-xs">
                <i className="bi bi-mortarboard-fill text-xl"></i>
              </div>
              <div>
                <div className="d-flex align-items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-base tracking-tight">StudentTrack</span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle text-[10px] font-mono px-1.5 py-0.5">
                    PBL v1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-0 d-none d-sm-block">
                  Node.js • Express • MongoDB • Mongoose • Chart.js
                </p>
              </div>
            </div>
          </div>

          {/* Center: Quick Role Switcher for College PBL Examiners */}
          <div className="d-none d-md-flex align-items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase px-2">Demo Role:</span>
            <button
              onClick={() => handleRoleSwitch('admin')}
              disabled={switching !== null}
              className={`btn btn-sm text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                currentUser?.role === 'admin'
                  ? 'btn-primary shadow-xs'
                  : 'btn-light border-0 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {switching === 'admin' ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <><i className="bi bi-shield-lock me-1"></i> Admin</>
              )}
            </button>

            <button
              onClick={() => handleRoleSwitch('faculty')}
              disabled={switching !== null}
              className={`btn btn-sm text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                currentUser?.role === 'faculty'
                  ? 'btn-primary shadow-xs'
                  : 'btn-light border-0 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {switching === 'faculty' ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <><i className="bi bi-person-video3 me-1"></i> Faculty</>
              )}
            </button>

            <button
              onClick={() => handleRoleSwitch('student')}
              disabled={switching !== null}
              className={`btn btn-sm text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                currentUser?.role === 'student'
                  ? 'btn-primary shadow-xs'
                  : 'btn-light border-0 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {switching === 'student' ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <><i className="bi bi-person-check me-1"></i> Student</>
              )}
            </button>
          </div>

          {/* Right: Actions & User Info */}
          <div className="d-flex align-items-center gap-2">
            {/* Quick Transcript link if student */}
            {currentUser?.role === 'student' && currentUser.studentRollNo && (
              <button
                onClick={() => onOpenReportCard(currentUser.studentRollNo!)}
                className="btn btn-sm btn-outline-primary d-none d-sm-inline-flex align-items-center gap-1.5 text-xs font-semibold rounded-lg"
              >
                <i className="bi bi-file-earmark-pdf"></i> Transcript
              </button>
            )}

            {/* Reset Database Seed */}
            <button
              onClick={handleReset}
              disabled={resetting}
              title="Reset MongoDB Database to Initial College Seed"
              className="btn btn-sm btn-light border text-slate-600 d-inline-flex align-items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <i className={`bi bi-arrow-repeat ${resetting ? 'animate-spin' : ''}`}></i>
              <span className="d-none d-lg-inline">{resetting ? 'Resetting DB...' : 'Reset DB Seed'}</span>
            </button>

            {/* User Profile Pill */}
            {currentUser ? (
              <div className="d-flex align-items-center gap-2 ps-2 border-start border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold d-flex align-items-center justify-content-center text-xs border border-blue-200">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="d-none d-xl-block text-start">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {currentUser.role} • {currentUser.department || 'Campus'}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="btn btn-sm btn-outline-danger p-1.5 rounded-lg ms-1"
                  title="Sign Out"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
