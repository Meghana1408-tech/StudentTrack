import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';

interface ReportCardModalProps {
  rollNo: string;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ rollNo, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await api.getStudentReport(rollNo);
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load student report card');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [rollNo]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-4 border border-slate-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white no-print">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 p-1.5 rounded-lg text-white">
              <i className="bi bi-file-earmark-pdf-fill text-lg"></i>
            </span>
            <div>
              <h5 className="font-bold text-sm tracking-wide mb-0">Official Academic Transcript & Report Card</h5>
              <p className="text-xs text-slate-400 mb-0">Generated from MongoDB College Database Record</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
            >
              <i className="bi bi-printer"></i> Print Transcript
            </button>
            <button
              onClick={onClose}
              className="btn btn-sm btn-outline-light d-inline-flex align-items-center px-2 py-1 rounded-lg text-xs"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        {/* Modal Content / Printable Area */}
        <div id="printable-report-area" className="p-8 bg-white text-slate-900">
          {loading ? (
            <div className="py-16 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-sm text-slate-500 mt-3 font-medium">Compiling student academic records...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
            </div>
          ) : report ? (
            <div>
              {/* Institution Header */}
              <div className="border-b-2 border-blue-900 pb-5 mb-6 text-center">
                <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                  <div className="bg-blue-800 text-white rounded-circle p-2 d-inline-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                    <i className="bi bi-mortarboard-fill text-2xl"></i>
                  </div>
                  <div className="text-start">
                    <h2 className="text-xl font-black tracking-tight text-blue-950 uppercase mb-0">
                      {report.institution?.name || 'Institute of Engineering & Technology'}
                    </h2>
                    <p className="text-xs text-slate-600 mb-0 font-medium">
                      {report.institution?.accreditation || 'Affiliated to National University | AICTE Approved'}
                    </p>
                  </div>
                </div>
                <div className="inline-block bg-blue-50 text-blue-900 font-bold px-4 py-1 rounded-full text-xs uppercase tracking-widest border border-blue-200 mt-2">
                  Cumulative Academic Performance & Attendance Report
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
                <div>
                  <span className="text-slate-500 block">Student Name</span>
                  <span className="font-bold text-slate-900 text-sm">{report.student?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Roll / Registration No.</span>
                  <span className="font-bold font-mono text-blue-700 text-sm">{report.student?.rollNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Department & Batch</span>
                  <span className="font-bold text-slate-900">
                    {report.student?.department} ({report.student?.batch})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Semester</span>
                  <span className="font-bold text-slate-900">Semester {report.student?.semester}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cumulative GPA (CGPA)</span>
                  <span className="font-bold text-emerald-600 text-sm">{report.student?.cgpa || '8.85'} / 10.0</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Overall Attendance</span>
                  <span
                    className={`font-bold text-sm ${
                      report.attendance?.rate >= 75 ? 'text-blue-700' : 'text-red-600'
                    }`}
                  >
                    {report.attendance?.rate}%{' '}
                    {report.attendance?.isDefaulter && (
                      <span className="badge bg-danger ms-1 text-[10px]">Shortage</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Faculty Advisor</span>
                  <span className="font-semibold text-slate-900">{report.student?.advisor}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Report Date</span>
                  <span className="font-semibold text-slate-700">{report.reportDate}</span>
                </div>
              </div>

              {/* Examination Scores Table */}
              <div className="mb-6">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="font-bold text-slate-900 text-xs tracking-wide uppercase mb-0">
                    Course Examination Scores & Grades
                  </h6>
                  <span className="text-xs text-slate-500">
                    Evaluation Weightage: Internal (30%) + Mid/End Term (70%)
                  </span>
                </div>
                <div className="table-responsive border border-slate-200 rounded-xl overflow-hidden">
                  <table className="table table-sm table-striped align-middle mb-0 text-xs">
                    <thead className="table-light text-slate-700 font-bold border-bottom">
                      <tr>
                        <th style={{ width: '12%' }}>Course Code</th>
                        <th>Course Title</th>
                        <th style={{ width: '15%' }}>Exam Type</th>
                        <th style={{ width: '12%' }} className="text-center">Score</th>
                        <th style={{ width: '12%' }} className="text-center">Grade</th>
                        <th>Faculty Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.marks?.records && report.marks.records.length > 0 ? (
                        report.marks.records.map((m: any, idx: number) => (
                          <tr key={idx}>
                            <td className="font-mono font-bold text-blue-700">{m.courseCode}</td>
                            <td className="font-medium text-slate-900">{m.courseName}</td>
                            <td>
                              <span className="badge bg-secondary-subtle text-secondary border">
                                {m.examType}
                              </span>
                            </td>
                            <td className="text-center font-bold">
                              {m.marksObtained} / {m.maxMarks}
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge ${
                                  m.grade === 'A+' || m.grade === 'A'
                                    ? 'bg-success text-white'
                                    : m.grade === 'B+' || m.grade === 'B'
                                    ? 'bg-primary text-white'
                                    : 'bg-warning text-dark'
                                } font-mono`}
                              >
                                {m.grade}
                              </span>
                            </td>
                            <td className="text-slate-600 italic text-[11px]">{m.remarks || 'Satisfactory'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-slate-500">
                            No examination records recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance & Conduct Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <h6 className="font-bold text-slate-900 text-xs uppercase mb-2">Attendance Summary</h6>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Total Instructional Sessions Held:</span>
                    <span className="font-bold text-slate-900">{report.attendance?.totalClasses || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Sessions Attended by Student:</span>
                    <span className="font-bold text-emerald-700">{report.attendance?.attendedScore || 0}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Statutory Eligibility Status:</span>
                    <span
                      className={`font-bold ${
                        report.attendance?.rate >= 75 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {report.attendance?.rate >= 75
                        ? 'Eligible for Final University Examinations'
                        : 'Conditionally Barred (Shortage of Attendance)'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <h6 className="font-bold text-slate-900 text-xs uppercase mb-2">Grading Key</h6>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                    <div><span className="font-bold text-emerald-700">A+</span> : 90-100% (Outstanding)</div>
                    <div><span className="font-bold text-blue-700">A</span> : 80-89% (Excellent)</div>
                    <div><span className="font-bold text-blue-600">B+</span> : 70-79% (Very Good)</div>
                    <div><span className="font-bold text-indigo-600">B</span> : 60-69% (Good)</div>
                    <div><span className="font-bold text-amber-600">C</span> : 50-59% (Average)</div>
                    <div><span className="font-bold text-red-600">F</span> : Below 40% (Fail)</div>
                  </div>
                </div>
              </div>

              {/* Official Signatures */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="border-b border-slate-300 pb-12 mb-2">
                    <span className="font-serif italic text-blue-900 text-sm opacity-80">R. Chen</span>
                  </div>
                  <span className="font-bold text-slate-900 block">Dr. Robert Chen</span>
                  <span className="text-slate-500 text-[11px]">Faculty Advisor & HOD (CSE)</span>
                </div>
                <div>
                  <div className="border-b border-slate-300 pb-12 mb-2">
                    <span className="font-serif italic text-blue-900 text-sm opacity-80">S. Jenkins</span>
                  </div>
                  <span className="font-bold text-slate-900 block">Prof. Sarah Jenkins</span>
                  <span className="text-slate-500 text-[11px]">Controller of Examinations</span>
                </div>
                <div>
                  <div className="border-b border-slate-300 pb-12 mb-2">
                    <div className="inline-block border border-dashed border-blue-400 rounded-full px-3 py-1 text-[10px] text-blue-800 uppercase font-mono">
                      [Official University Seal]
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 block">Dean of Academic Affairs</span>
                  <span className="text-slate-500 text-[11px]">Institute Seal & Verification</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
