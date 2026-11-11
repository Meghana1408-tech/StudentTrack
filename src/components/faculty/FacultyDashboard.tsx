import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { FacultyDashboardData, Course, Student, Assignment } from '../../types/index.ts';

interface FacultyDashboardProps {
  activeTab: string;
  onOpenReportCard: (rollNo: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ activeTab, onOpenReportCard }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Attendance Marking State
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCourseCode, setSelectedCourseCode] = useState('CS401');
  const [attendanceRecords, setAttendanceRecords] = useState<
    Array<{ rollNo: string; studentName: string; status: 'Present' | 'Absent' | 'Late' }>
  >([]);
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  // Marks Entry State
  const [marksCourseCode, setMarksCourseCode] = useState('CS401');
  const [marksExamType, setMarksExamType] = useState<'Internal 1' | 'Mid-Term' | 'End-Term' | 'Practical'>('Mid-Term');
  const [marksMax, setMarksMax] = useState(100);
  const [studentMarksInputs, setStudentMarksInputs] = useState<
    Record<string, { score: number | string; remarks: string }>
  >({});
  const [marksSaving, setMarksSaving] = useState(false);

  // Assignment Creation State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    courseCode: 'CS401',
    dueDate: '',
    maxMarks: 20,
    description: '',
  });
  const [creatingAssignment, setCreatingAssignment] = useState(false);

  // Grading Drawer State
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState<any>(null);
  const [gradingSubmission, setGradingSubmission] = useState<{ id: string; marks: number; feedback: string } | null>(
    null
  );
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [facultyData, courseList, studentList, assignmentList] = await Promise.all([
        api.getFacultyDashboard(),
        api.getCourses(),
        api.getStudents({ department: 'Computer Science', semester: 4 }),
        api.getAssignments(),
      ]);
      setData(facultyData);
      setCourses(courseList);
      setStudents(studentList);
      setAssignments(assignmentList);

      // Initialize default attendance records
      const initialRecords = studentList.map((s) => ({
        rollNo: s.rollNo,
        studentName: s.name,
        status: 'Present' as const,
      }));
      setAttendanceRecords(initialRecords);

      // Initialize default marks inputs
      const initialMarks: Record<string, { score: number | string; remarks: string }> = {};
      studentList.forEach((s) => {
        initialMarks[s.rollNo] = { score: 85, remarks: 'Good understanding' };
      });
      setStudentMarksInputs(initialMarks);
    } catch (err: any) {
      console.error('Failed to load faculty dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Attendance Handlers
  const handleToggleAttendance = (rollNo: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.rollNo === rollNo ? { ...r, status } : r))
    );
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    setAttendanceRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSaveAttendance = async () => {
    try {
      setAttendanceSaving(true);
      const res = await api.markAttendance({
        date: attendanceDate,
        courseCode: selectedCourseCode,
        semester: 4,
        department: 'Computer Science',
        records: attendanceRecords,
      });
      showToast(res.message || 'Attendance saved to MongoDB!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setAttendanceSaving(false);
    }
  };

  // Marks Handlers
  const handleSaveMarks = async () => {
    try {
      setMarksSaving(true);
      const entries = students.map((s) => ({
        studentRollNo: s.rollNo,
        studentName: s.name,
        marksObtained: Number(studentMarksInputs[s.rollNo]?.score || 0),
        remarks: studentMarksInputs[s.rollNo]?.remarks || '',
      }));

      const res = await api.bulkEnterMarks({
        courseCode: marksCourseCode,
        courseName: courses.find((c) => c.code === marksCourseCode)?.title,
        examType: marksExamType,
        maxMarks: marksMax,
        entries,
      });
      showToast(res.message || 'Examination marks recorded in MongoDB!');
    } catch (err: any) {
      alert(err.message || 'Failed to save marks');
    } finally {
      setMarksSaving(false);
    }
  };

  // Assignment Handlers
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingAssignment(true);
      await api.createAssignment(newAssignment);
      showToast(`Assignment "${newAssignment.title}" published!`);
      setIsAssignmentModalOpen(false);
      setNewAssignment({
        title: '',
        courseCode: 'CS401',
        dueDate: '',
        maxMarks: 20,
        description: '',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create assignment');
    } finally {
      setCreatingAssignment(false);
    }
  };

  const handleOpenGrading = async (assignment: Assignment) => {
    try {
      const details = await api.getAssignmentDetails(assignment._id);
      setSelectedAssignmentForGrading(details);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    if (!gradingSubmission) return;
    try {
      setSubmittingGrade(true);
      await api.gradeSubmission(submissionId, {
        marksAwarded: gradingSubmission.marks,
        feedback: gradingSubmission.feedback,
      });
      showToast('Submission graded successfully!');
      setGradingSubmission(null);
      if (selectedAssignmentForGrading) {
        const refreshed = await api.getAssignmentDetails(selectedAssignmentForGrading._id);
        setSelectedAssignmentForGrading(refreshed);
      }
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingGrade(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading faculty course portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-slate-700">
          <i className="bi bi-check-circle-fill text-emerald-400"></i>
          {toastMessage}
        </div>
      )}

      {/* Faculty Hero Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/20">
            <i className="bi bi-person-video3"></i>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-200 mb-1 border border-blue-400/30">
              Department of Computer Science & Engineering
            </div>
            <h2 className="text-xl font-black mb-0.5">{data?.facultyName || 'Dr. Robert Chen'}</h2>
            <p className="text-xs text-blue-200 mb-0">Professor & Head of Department • Semester 4 Instructor</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAssignmentModalOpen(true)}
            className="btn btn-sm btn-light text-blue-900 font-bold text-xs px-3 py-2 rounded-xl shadow-xs"
          >
            <i className="bi bi-plus-circle me-1"></i> New Assignment
          </button>
        </div>
      </div>

      {/* TAB 1: FACULTY DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="st-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Assigned Subjects</span>
                <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i className="bi bi-book-fill"></i>
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-0">{data?.courses.length || 3}</h3>
              <span className="text-[11px] text-slate-400">CS401, CS402, CS405 PBL Lab</span>
            </div>

            <div className="st-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Class Strength</span>
                <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <i className="bi bi-people-fill"></i>
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-0">{data?.totalStudentsCount || 10}</h3>
              <span className="text-[11px] text-slate-400">Enrolled in CS 4th Sem</span>
            </div>

            <div className="st-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Active Assignments</span>
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <i className="bi bi-journal-text"></i>
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-0">{data?.activeAssignmentsCount || 2}</h3>
              <span className="text-[11px] text-emerald-600 font-semibold">Submissions in progress</span>
            </div>

            <div className="st-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Pending Grading</span>
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <i className="bi bi-hourglass-split"></i>
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-0">{data?.pendingGradingCount || 0}</h3>
              <span className="text-[11px] text-amber-600 font-semibold">Awaiting score & feedback</span>
            </div>
          </div>

          {/* Assigned Courses Cards */}
          <div className="st-card p-5">
            <h4 className="text-base font-black text-slate-900 mb-1">Instructional Course Load</h4>
            <p className="text-xs text-slate-500 mb-4">Curriculum courses handled by Dr. Robert Chen</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courses.map((c) => (
                <div key={c._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge bg-primary font-mono text-xs">{c.code}</span>
                    <span className="text-[11px] font-bold text-slate-500">{c.credits} Credits</span>
                  </div>
                  <h6 className="font-bold text-slate-900 text-sm mb-1">{c.title}</h6>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => setSelectedCourseCode(c.code)}
                      className="btn btn-xs btn-outline-primary text-[11px] font-semibold py-1 px-2.5 rounded-lg"
                    >
                      Mark Attendance
                    </button>
                    <button
                      onClick={() => setMarksCourseCode(c.code)}
                      className="btn btn-xs btn-light border text-[11px] font-semibold py-1 px-2.5 rounded-lg"
                    >
                      Enter Marks
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARK ATTENDANCE */}
      {(activeTab === 'attendance' || activeTab === 'dashboard') && (
        <div className="st-card p-5">
          <div className="d-flex flex-column flex-md-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 mb-0.5">Instructional Attendance Register</h4>
              <p className="text-xs text-slate-500 mb-0">
                Mark date-wise presence for students and persist directly to MongoDB.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="btn btn-sm btn-outline-success text-xs font-semibold px-2.5 py-1.5 rounded-lg"
              >
                <i className="bi bi-check-all me-1"></i> All Present
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={attendanceSaving}
                className="btn btn-sm btn-primary text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs"
              >
                {attendanceSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                    Saving to MongoDB...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-arrow-up-fill me-1"></i> Submit Attendance
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Session Selector Bar */}
          <div className="row g-2 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs font-semibold">
            <div className="col-12 col-md-4">
              <label className="text-slate-500 block mb-1">Session Date</label>
              <input
                type="date"
                className="form-control form-control-sm text-xs font-mono"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="text-slate-500 block mb-1">Course / Subject</label>
              <select
                className="form-select form-select-sm text-xs"
                value={selectedCourseCode}
                onChange={(e) => setSelectedCourseCode(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="text-slate-500 block mb-1">Department & Semester</label>
              <div className="form-control form-control-sm text-xs bg-white text-slate-700">
                Computer Science • Semester 4
              </div>
            </div>
          </div>

          {/* Attendance Student Table */}
          <div className="table-responsive border border-slate-200 rounded-xl overflow-hidden">
            <table className="table table-hover align-middle mb-0 text-xs">
              <thead className="table-light text-slate-700 font-bold">
                <tr>
                  <th style={{ width: '15%' }}>Roll Number</th>
                  <th>Student Name</th>
                  <th style={{ width: '25%' }} className="text-center">Status</th>
                  <th style={{ width: '20%' }} className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((rec) => (
                  <tr key={rec.rollNo}>
                    <td className="font-mono font-bold text-blue-700">{rec.rollNo}</td>
                    <td className="font-semibold text-slate-900">{rec.studentName}</td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(rec.rollNo, 'Present')}
                          className={`btn btn-xs px-3 py-1 font-semibold ${
                            rec.status === 'Present'
                              ? 'btn-success text-white'
                              : 'btn-outline-secondary'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(rec.rollNo, 'Late')}
                          className={`btn btn-xs px-3 py-1 font-semibold ${
                            rec.status === 'Late'
                              ? 'btn-warning text-dark'
                              : 'btn-outline-secondary'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(rec.rollNo, 'Absent')}
                          className={`btn btn-xs px-3 py-1 font-semibold ${
                            rec.status === 'Absent'
                              ? 'btn-danger text-white'
                              : 'btn-outline-secondary'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => onOpenReportCard(rec.rollNo)}
                        className="btn btn-xs btn-outline-secondary py-1 px-2.5 text-[11px]"
                      >
                        <i className="bi bi-file-earmark-text me-1"></i> Transcript
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ENTER EXAMINATION MARKS */}
      {(activeTab === 'marks' || activeTab === 'dashboard') && (
        <div className="st-card p-5">
          <div className="d-flex flex-column flex-md-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 mb-0.5">Examination Marks Entry</h4>
              <p className="text-xs text-slate-500 mb-0">
                Record mid-term, end-term, internal scores, and automatically compute student letter grades.
              </p>
            </div>
            <button
              onClick={handleSaveMarks}
              disabled={marksSaving}
              className="btn btn-sm btn-primary text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
            >
              {marksSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                  Recording to MongoDB...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-1"></i> Save All Examination Marks
                </>
              )}
            </button>
          </div>

          {/* Exam Filters */}
          <div className="row g-2 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs font-semibold">
            <div className="col-12 col-md-4">
              <label className="text-slate-500 block mb-1">Subject</label>
              <select
                className="form-select form-select-sm text-xs"
                value={marksCourseCode}
                onChange={(e) => setMarksCourseCode(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="text-slate-500 block mb-1">Exam Type</label>
              <select
                className="form-select form-select-sm text-xs"
                value={marksExamType}
                onChange={(e) => setMarksExamType(e.target.value as any)}
              >
                <option value="Internal 1">Internal Test 1</option>
                <option value="Internal 2">Internal Test 2</option>
                <option value="Mid-Term">Mid-Term Examination</option>
                <option value="End-Term">End-Term University Exam</option>
                <option value="Practical">PBL Practical Assessment</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="text-slate-500 block mb-1">Max Marks</label>
              <input
                type="number"
                className="form-control form-control-sm text-xs font-mono"
                value={marksMax}
                onChange={(e) => setMarksMax(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Marks Input Table */}
          <div className="table-responsive border border-slate-200 rounded-xl overflow-hidden">
            <table className="table table-hover align-middle mb-0 text-xs">
              <thead className="table-light text-slate-700 font-bold">
                <tr>
                  <th style={{ width: '15%' }}>Roll Number</th>
                  <th>Student Name</th>
                  <th style={{ width: '15%' }} className="text-center">Marks Obtained (/{marksMax})</th>
                  <th style={{ width: '12%' }} className="text-center">Calculated Grade</th>
                  <th style={{ width: '35%' }}>Remarks / Evaluation Notes</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => {
                  const score = Number(studentMarksInputs[stu.rollNo]?.score ?? 85);
                  const pct = Math.round((score / marksMax) * 100);
                  const grade =
                    pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';

                  return (
                    <tr key={stu.rollNo}>
                      <td className="font-mono font-bold text-blue-700">{stu.rollNo}</td>
                      <td className="font-semibold text-slate-900">{stu.name}</td>
                      <td className="text-center">
                        <input
                          type="number"
                          min="0"
                          max={marksMax}
                          className="form-control form-control-sm text-center font-bold font-mono text-xs max-w-[90px] mx-auto"
                          value={studentMarksInputs[stu.rollNo]?.score ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudentMarksInputs({
                              ...studentMarksInputs,
                              [stu.rollNo]: {
                                score: val === '' ? '' : Number(val),
                                remarks: studentMarksInputs[stu.rollNo]?.remarks || '',
                              },
                            });
                          }}
                        />
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${
                            grade === 'A+' || grade === 'A'
                              ? 'bg-success text-white'
                              : grade === 'B+' || grade === 'B'
                              ? 'bg-primary text-white'
                              : 'bg-warning text-dark'
                          } font-mono text-xs`}
                        >
                          {grade} ({pct}%)
                        </span>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm text-xs"
                          placeholder="e.g. Well formulated queries, good diagram"
                          value={studentMarksInputs[stu.rollNo]?.remarks || ''}
                          onChange={(e) => {
                            setStudentMarksInputs({
                              ...studentMarksInputs,
                              [stu.rollNo]: {
                                score: studentMarksInputs[stu.rollNo]?.score ?? 0,
                                remarks: e.target.value,
                              },
                            });
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ASSIGNMENTS & GRADING */}
      {(activeTab === 'assignments' || activeTab === 'dashboard') && (
        <div className="st-card p-5">
          <div className="d-flex flex-column flex-md-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 mb-0.5">Academic Assignments & Submissions</h4>
              <p className="text-xs text-slate-500 mb-0">
                Create coursework, monitor student uploads, and grade submissions.
              </p>
            </div>
            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="btn btn-sm btn-primary text-xs font-bold px-3 py-2 rounded-xl shadow-xs"
            >
              <i className="bi bi-plus-lg me-1"></i> Create Assignment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((ass) => (
              <div key={ass._id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="badge bg-primary font-mono text-[11px]">{ass.courseCode}</span>
                  <span
                    className={`badge ${
                      ass.status === 'Open' ? 'bg-success text-white' : 'bg-secondary text-white'
                    } text-[10px]`}
                  >
                    {ass.status}
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
                    <span className="text-slate-400 block text-[10px]">Submissions</span>
                    <span className="font-bold text-blue-600">{ass.submissionsCount || 0}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenGrading(ass)}
                    className="btn btn-sm btn-outline-primary text-xs font-semibold px-3 py-1.5 rounded-lg w-full"
                  >
                    <i className="bi bi-folder2-open me-1"></i> View Submissions & Grade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Creation Modal */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h5 className="font-bold text-sm tracking-wide mb-0">Publish New Course Assignment</h5>
              <button
                onClick={() => setIsAssignmentModalOpen(false)}
                className="btn btn-sm btn-outline-light px-2 py-0.5 rounded-lg"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="p-6 text-xs font-semibold text-slate-700 space-y-3">
              <div>
                <label className="form-label">Assignment Title *</label>
                <input
                  type="text"
                  className="form-control form-control-sm text-xs"
                  placeholder="e.g. Lab 4: B+ Tree Indexing"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Course *</label>
                  <select
                    className="form-select form-select-sm text-xs"
                    value={newAssignment.courseCode}
                    onChange={(e) => setNewAssignment({ ...newAssignment, courseCode: e.target.value })}
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Max Marks</label>
                  <input
                    type="number"
                    className="form-control form-control-sm text-xs"
                    value={newAssignment.maxMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  className="form-control form-control-sm text-xs font-mono"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Instructions / Description</label>
                <textarea
                  className="form-control form-control-sm text-xs"
                  rows={3}
                  placeholder="Describe problem statement and submission guidelines..."
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="btn btn-sm btn-light border"
                >
                  Cancel
                </button>
                <button type="submit" disabled={creatingAssignment} className="btn btn-sm btn-primary">
                  {creatingAssignment ? 'Publishing...' : 'Publish to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions & Grading Drawer Modal */}
      {selectedAssignmentForGrading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <h5 className="font-bold text-sm tracking-wide mb-0.5">
                  Submissions: {selectedAssignmentForGrading.title}
                </h5>
                <span className="text-xs text-slate-400">
                  Course: {selectedAssignmentForGrading.courseCode} • Max Marks: {selectedAssignmentForGrading.maxMarks}
                </span>
              </div>
              <button
                onClick={() => setSelectedAssignmentForGrading(null)}
                className="btn btn-sm btn-outline-light px-2 py-0.5 rounded-lg"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="p-6">
              {selectedAssignmentForGrading.submissions && selectedAssignmentForGrading.submissions.length > 0 ? (
                <div className="space-y-4">
                  {selectedAssignmentForGrading.submissions.map((sub: any) => (
                    <div key={sub._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{sub.studentName}</span>
                          <span className="font-mono text-xs text-blue-700 ms-2">({sub.studentRollNo})</span>
                          <div className="text-[11px] text-slate-500">
                            Submitted: {new Date(sub.submittedAt).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`badge ${
                            sub.status === 'Graded' ? 'bg-success text-white' : 'bg-warning text-dark'
                          }`}
                        >
                          {sub.status} {sub.marksAwarded !== undefined && `(${sub.marksAwarded}/${selectedAssignmentForGrading.maxMarks})`}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-800 mb-3">
                        <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Student Answer:</div>
                        <p className="mb-1">{sub.answerText}</p>
                        {sub.fileAttachment && (
                          <div className="text-blue-600 font-mono text-[11px]">
                            <i className="bi bi-paperclip me-1"></i> {sub.fileAttachment}
                          </div>
                        )}
                      </div>

                      {/* Grading form */}
                      {sub.status === 'Graded' ? (
                        <div className="text-xs text-slate-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                          <span className="font-bold text-emerald-800">Faculty Feedback:</span> {sub.feedback || 'None provided'}
                        </div>
                      ) : (
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <span className="text-xs font-bold text-slate-700 block mb-2">Enter Score & Evaluation:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                            <div>
                              <input
                                type="number"
                                min="0"
                                max={selectedAssignmentForGrading.maxMarks}
                                placeholder="Marks"
                                className="form-control form-control-sm text-xs font-bold font-mono"
                                value={gradingSubmission && gradingSubmission.id === sub._id ? gradingSubmission.marks : ''}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setGradingSubmission((prev) => ({
                                    id: sub._id,
                                    marks: val,
                                    feedback: prev && prev.id === sub._id ? prev.feedback : '',
                                  }));
                                }}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                placeholder="Written feedback to student..."
                                className="form-control form-control-sm text-xs"
                                value={gradingSubmission && gradingSubmission.id === sub._id ? gradingSubmission.feedback : ''}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setGradingSubmission((prev) => ({
                                    id: sub._id,
                                    marks: prev && prev.id === sub._id ? prev.marks : 0,
                                    feedback: text,
                                  }));
                                }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleSaveGrade(sub._id)}
                            disabled={submittingGrade || gradingSubmission?.id !== sub._id}
                            className="btn btn-sm btn-primary text-xs font-bold px-3 py-1 rounded-lg"
                          >
                            Save Grade to MongoDB
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <i className="bi bi-inbox text-3xl d-block mb-2"></i>
                  <p className="text-xs">No students have submitted this assignment yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
