import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { StudentDashboardData, Assignment } from '../../types/index.ts';
import { ChartComponent } from '../common/ChartComponent.tsx';

interface StudentDashboardProps {
  activeTab: string;
  onOpenReportCard: (rollNo: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeTab, onOpenReportCard }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentDashboardData | null>(null);

  // Submit Assignment State
  const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmission) return;

    try {
      setSubmitting(true);
      await api.submitAssignment(selectedAssignmentForSubmission._id, {
        answerText: submissionText,
        fileAttachment: fileName || `${data?.student.rollNo}_submission.pdf`,
      });
      showToast('Assignment submitted successfully to faculty!');
      setSelectedAssignmentForSubmission(null);
      setSubmissionText('');
      setFileName('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading student portal & academic records...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="alert alert-danger m-4">
        Unable to load student profile. Please verify your login credentials.
      </div>
    );
  }

  const { student, overallAttendance, isAttendanceLow, subjectStats, marks, assignments } = data;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-slate-700">
          <i className="bi bi-check-circle-fill text-emerald-400"></i>
          {toastMessage}
        </div>
      )}

      {/* Student Profile Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/20">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-100 mb-1">
              <span className="font-mono">{student.rollNo}</span> • Semester {student.semester}
            </div>
            <h2 className="text-xl font-black mb-0.5">{student.name}</h2>
            <p className="text-xs text-blue-200 mb-0">
              {student.department} • Batch {student.batch} • Mentor: {student.advisor}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReportCard(student.rollNo)}
            className="btn btn-sm btn-light text-blue-900 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs d-inline-flex align-items-center gap-1.5"
          >
            <i className="bi bi-file-earmark-pdf-fill text-primary"></i> Official Transcript
          </button>
        </div>
      </div>

      {/* Attendance Shortage Warning Alert */}
      {isAttendanceLow && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-3 px-4 rounded-xl shadow-xs border-0 text-xs">
          <i className="bi bi-exclamation-triangle-fill text-lg"></i>
          <div>
            <strong>Attendance Shortage Alert:</strong> Your cumulative attendance is currently{' '}
            <span className="font-bold">{overallAttendance}%</span>, which is below the mandatory 75% university eligibility requirement. Please meet with your faculty advisor.
          </div>
        </div>
      )}

      {/* TAB 1: ACADEMIC OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="st-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Cumulative CGPA</span>
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <i className="bi bi-award-fill"></i>
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-0">{student.cgpa || '8.85'}</h3>
              <span className="text-[11px] text-emerald-600 font-semibold">Distinction Grade</span>
            </div>

            <div className="st-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Overall Attendance</span>
                <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i className="bi bi-pie-chart-fill"></i>
                </span>
              </div>
              <h3
                className={`text-2xl font-black mb-0 ${
                  overallAttendance >= 75 ? 'text-blue-700' : 'text-red-600'
                }`}
              >
                {overallAttendance}%
              </h3>
              <span className="text-[11px] text-slate-400">
                {overallAttendance >= 75 ? 'Eligible for Final Exams' : 'Shortage Notice'}
              </span>
            </div>

            <div className="st-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Enrolled Courses</span>
                <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <i className="bi bi-book-half"></i>
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-0">{subjectStats.length || 5}</h3>
              <span className="text-[11px] text-slate-400">Semester 4 Curriculum</span>
            </div>

            <div className="st-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Assignments</span>
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <i className="bi bi-journal-check"></i>
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-0">
                {assignments.filter((a) => a.isSubmitted).length} / {assignments.length}
              </h3>
              <span className="text-[11px] text-slate-500">Completed & Graded</span>
            </div>
          </div>

          {/* Academic Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Attendance Performance */}
            <div className="st-card p-5">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h5 className="text-sm font-bold text-slate-900 mb-0.5">Subject Attendance Rates</h5>
                  <p className="text-xs text-slate-500 mb-0">Your percentage across instructional subjects</p>
                </div>
                <span className="badge bg-primary font-mono text-[11px]">{overallAttendance}% Overall</span>
              </div>
              <ChartComponent
                type="bar"
                labels={subjectStats.map((s) => s.code)}
                data={subjectStats.map((s) => s.rate)}
                label="Attendance Rate (%)"
                height={220}
              />
            </div>

            {/* Subject Examination Scores Chart */}
            <div className="st-card p-5">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h5 className="text-sm font-bold text-slate-900 mb-0.5">Examination Performance</h5>
                  <p className="text-xs text-slate-500 mb-0">Scores obtained in recent midterm and labs</p>
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle text-[11px]">
                  GPA: {student.cgpa}
                </span>
              </div>
              <ChartComponent
                type="bar"
                labels={marks.map((m) => m.courseCode)}
                data={marks.map((m) => m.marksObtained)}
                label="Score (/100)"
                height={220}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY ATTENDANCE LOGS */}
      {(activeTab === 'attendance' || activeTab === 'dashboard') && (
        <div className="st-card p-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 mb-0.5">Subject-Wise Attendance Breakdown</h4>
              <p className="text-xs text-slate-500 mb-0">
                Detailed attendance statistics per enrolled curriculum subject.
              </p>
            </div>
            <span
              className={`badge ${
                overallAttendance >= 75 ? 'bg-success' : 'bg-danger'
              } px-3 py-1.5 text-xs font-bold`}
            >
              Overall: {overallAttendance}%
            </span>
          </div>

          <div className="space-y-3">
            {subjectStats.map((subj, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="d-flex flex-column flex-sm-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-mono text-xs me-2">
                      {subj.code}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{subj.title}</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-xs text-slate-500">
                      Attended <strong>{subj.attended}</strong> of <strong>{subj.total}</strong> sessions
                    </span>
                    <span
                      className={`badge ${
                        subj.rate >= 75
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      } font-mono font-bold text-xs`}
                    >
                      {subj.rate}%
                    </span>
                  </div>
                </div>

                <div className="progress" style={{ height: '7px' }}>
                  <div
                    className={`progress-bar ${subj.rate >= 75 ? 'bg-primary' : 'bg-danger'}`}
                    style={{ width: `${subj.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MY EXAMINATION GRADES */}
      {(activeTab === 'marks' || activeTab === 'dashboard') && (
        <div className="st-card p-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 mb-0.5">Examination Grades & Scores</h4>
              <p className="text-xs text-slate-500 mb-0">Official academic assessment scores and faculty evaluations.</p>
            </div>
            <button
              onClick={() => onOpenReportCard(student.rollNo)}
              className="btn btn-sm btn-outline-primary text-xs font-semibold px-3 py-1.5 rounded-lg"
            >
              <i className="bi bi-printer me-1"></i> Print Grade Sheet
            </button>
          </div>

          <div className="table-responsive border border-slate-200 rounded-xl overflow-hidden">
            <table className="table table-hover align-middle mb-0 text-xs">
              <thead className="table-light text-slate-700 font-bold border-bottom">
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Exam Type</th>
                  <th className="text-center">Score</th>
                  <th className="text-center">Grade</th>
                  <th>Faculty Comments</th>
                </tr>
              </thead>
              <tbody>
                {marks.length > 0 ? (
                  marks.map((m) => (
                    <tr key={m._id}>
                      <td className="font-mono font-bold text-blue-700">{m.courseCode}</td>
                      <td className="font-medium text-slate-900">{m.courseName}</td>
                      <td>
                        <span className="badge bg-slate-100 text-slate-700 border">{m.examType}</span>
                      </td>
                      <td className="text-center font-bold font-mono">
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
                      <td className="text-slate-600 italic text-[11px]">{m.remarks || 'Satisfactory work'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No examination marks published yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ASSIGNMENTS & SUBMISSIONS */}
      {(activeTab === 'assignments' || activeTab === 'dashboard') && (
        <div className="st-card p-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 mb-0.5">Assignments Tracker</h4>
              <p className="text-xs text-slate-500 mb-0">Upload coursework solutions and view faculty evaluation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((ass) => (
              <div key={ass._id} className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="badge bg-primary font-mono text-[11px]">{ass.courseCode}</span>
                  <span
                    className={`badge ${
                      ass.isGraded
                        ? 'bg-success text-white'
                        : ass.isSubmitted
                        ? 'bg-primary text-white'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    } text-[10px] font-bold`}
                  >
                    {ass.isGraded ? 'Graded' : ass.isSubmitted ? 'Submitted' : 'Pending Submission'}
                  </span>
                </div>

                <h5 className="font-bold text-slate-900 text-sm mb-1">{ass.title}</h5>
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{ass.description}</p>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs text-slate-600 mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Due Date</span>
                    <span className="font-bold text-slate-800">{ass.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Max Marks</span>
                    <span className="font-bold text-slate-800">{ass.maxMarks}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Your Score</span>
                    <span className="font-bold text-blue-600">
                      {ass.marksAwarded !== undefined ? `${ass.marksAwarded} / ${ass.maxMarks}` : 'Pending'}
                    </span>
                  </div>
                </div>

                {ass.isGraded && ass.mySubmission?.feedback && (
                  <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-lg border border-emerald-200 text-xs mb-3">
                    <span className="font-bold block text-[10px] uppercase text-emerald-700">Faculty Feedback:</span>
                    {ass.mySubmission.feedback}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedAssignmentForSubmission(ass)}
                    className={`btn btn-sm ${
                      ass.isSubmitted ? 'btn-outline-primary' : 'btn-primary'
                    } text-xs font-semibold px-3 py-1.5 rounded-lg w-full`}
                  >
                    {ass.isSubmitted ? (
                      <><i className="bi bi-arrow-repeat me-1"></i> Resubmit Work</>
                    ) : (
                      <><i className="bi bi-upload me-1"></i> Submit Assignment</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Submission Modal */}
      {selectedAssignmentForSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h5 className="font-bold text-sm tracking-wide mb-0">
                  Submit Work: {selectedAssignmentForSubmission.title}
                </h5>
                <span className="text-xs text-slate-400">
                  Course: {selectedAssignmentForSubmission.courseCode} • Due: {selectedAssignmentForSubmission.dueDate}
                </span>
              </div>
              <button
                onClick={() => setSelectedAssignmentForSubmission(null)}
                className="btn btn-sm btn-outline-light px-2 py-0.5 rounded-lg"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="p-6 text-xs font-semibold text-slate-700 space-y-3">
              <div>
                <label className="form-label">Submission Description / Notes *</label>
                <textarea
                  className="form-control form-control-sm text-xs"
                  rows={4}
                  placeholder="Summarize your work, algorithms implemented, and instructions..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Attached File Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm text-xs font-mono"
                  placeholder="e.g. AlexMorgan_CS401_PBL.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
                <span className="text-slate-400 text-[10px] block mt-0.5">
                  Simulated submission file attachment saved into MongoDB submission record.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedAssignmentForSubmission(null)}
                  className="btn btn-sm btn-light border"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-sm btn-primary">
                  {submitting ? 'Uploading to MongoDB...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
