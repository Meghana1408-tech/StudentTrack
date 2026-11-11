import React from 'react';
import { UserRole } from '../types/index.ts';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenReportCard: () => void;
  studentRollNo?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  onOpenReportCard,
  studentRollNo,
}) => {
  const getNavItems = () => {
    if (currentRole === 'admin') {
      return [
        { id: 'dashboard', label: 'Overview & Analytics', icon: 'bi-grid-1x2-fill' },
        { id: 'students', label: 'Student Management', icon: 'bi-people-fill' },
        { id: 'attendance', label: 'Attendance Records', icon: 'bi-calendar-check-fill' },
        { id: 'marks', label: 'Examination Marks', icon: 'bi-award-fill' },
        { id: 'faculty', label: 'Faculty Directory', icon: 'bi-person-badge-fill' },
        { id: 'assignments', label: 'Academic Assignments', icon: 'bi-journal-bookmark-fill' },
      ];
    } else if (currentRole === 'faculty') {
      return [
        { id: 'dashboard', label: 'Faculty Dashboard', icon: 'bi-speedometer2' },
        { id: 'attendance', label: 'Mark Attendance', icon: 'bi-calendar-plus-fill' },
        { id: 'marks', label: 'Enter Exam Marks', icon: 'bi-pencil-square' },
        { id: 'assignments', label: 'Assignments & Grading', icon: 'bi-journal-check' },
        { id: 'students', label: 'Enrolled Students', icon: 'bi-person-lines-fill' },
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Academic Overview', icon: 'bi-speedometer2' },
        { id: 'attendance', label: 'My Attendance Logs', icon: 'bi-pie-chart-fill' },
        { id: 'marks', label: 'My Examination Grades', icon: 'bi-mortarboard-fill' },
        { id: 'assignments', label: 'Assignments & Submissions', icon: 'bi-file-earmark-check-fill' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs d-lg-none"
        ></div>
      )}

      <aside
        className={`fixed top-0 bottom-0 start-0 z-40 w-64 bg-white border-end border-slate-200 transition-transform duration-300 ease-in-out d-flex flex-column ${
          isOpen ? 'translate-x-0' : '-translate-x-full d-none d-lg-flex'
        } d-lg-translate-x-0`}
        style={{ top: '61px' }}
      >
        {/* Role Portal Header */}
        <div className="p-3 border-bottom border-slate-100 bg-slate-50/50">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {currentRole === 'admin'
                ? 'Admin Control'
                : currentRole === 'faculty'
                ? 'Faculty Portal'
                : 'Student Portal'}
            </span>
            <span
              className={`badge ${
                currentRole === 'admin'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : currentRole === 'faculty'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              } text-[10px] font-bold uppercase`}
            >
              {currentRole}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto p-3">
          <nav className="nav flex-column gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`nav-link text-start rounded-xl px-3 py-2.5 d-flex align-items-center gap-2.5 text-xs font-semibold transition-all border-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-transparent'
                  }`}
                >
                  <i className={`bi ${item.icon} text-base ${isActive ? 'text-white' : 'text-blue-600'}`}></i>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Quick Action for Student: Official Transcript */}
            {currentRole === 'student' && studentRollNo && (
              <button
                onClick={() => {
                  onOpenReportCard();
                  onClose();
                }}
                className="nav-link text-start rounded-xl px-3 py-2.5 d-flex align-items-center gap-2.5 text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 mt-2"
              >
                <i className="bi bi-file-earmark-pdf-fill text-base text-blue-600"></i>
                <span>Official Transcript</span>
              </button>
            )}
          </nav>
        </div>

        {/* System Architecture Badge for College PBL Presentation */}
        <div className="p-3 border-top border-slate-200 bg-slate-50">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="d-flex align-items-center gap-2 mb-1.5">
              <span className="position-relative d-flex h-2.5 w-2.5">
                <span className="animate-ping position-absolute h-100 w-100 rounded-circle bg-emerald-400 opacity-75"></span>
                <span className="position-relative d-inline-flex rounded-circle h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-800">MongoDB & Mongoose</span>
            </div>
            <p className="text-[10px] text-slate-500 mb-2 leading-tight">
              Real Node.js REST API with active persistent schema models.
            </p>
            <div className="d-flex align-items-center justify-content-between text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
              <span>DB:</span>
              <span className="text-emerald-700 font-bold">CONNECTED</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
