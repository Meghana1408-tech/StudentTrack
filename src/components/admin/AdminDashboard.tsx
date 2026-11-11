import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { AdminDashboardData, Student, Faculty, Course } from '../../types/index.ts';
import { ChartComponent } from '../common/ChartComponent.tsx';
import { StudentModal } from './StudentModal.tsx';
import { StudentDetailsModal } from '../common/StudentDetailsModal.tsx';

interface AdminDashboardProps {
  activeTab: string;
  onOpenReportCard: (rollNo: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab, onOpenReportCard }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);

  // Filters for student management
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [semFilter, setSemFilter] = useState('All');

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [viewingStudentRoll, setViewingStudentRoll] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashData, studentList, facultyList, courseList, attSummary] = await Promise.all([
        api.getAdminDashboard(),
        api.getStudents(),
        api.getFacultyList(),
        api.getCourses(),
        api.getAttendanceSummary(),
      ]);
      setData(dashData);
      setStudents(studentList);
      setFaculty(facultyList);
      setCourses(courseList);
      setAttendanceSummary(attSummary);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
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

  // Student CRUD actions
  const handleSaveStudent = async (studentData: Partial<Student>) => {
    if (selectedStudentForEdit) {
      await api.updateStudent(selectedStudentForEdit._id, studentData);
      showToast(`Updated student ${studentData.name} successfully!`);
    } else {
      await api.createStudent(studentData);
      showToast(`Added new student ${studentData.name} to MongoDB!`);
    }
    await loadData();
  };

  const handleDeleteStudent = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete student ${student.name} (${student.rollNo})?`)) {
      try {
        await api.deleteStudent(student._id);
        showToast(`Deleted student ${student.rollNo}`);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete student');
      }
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      searchTerm === '' ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    const matchesSem = semFilter === 'All' || String(s.semester) === semFilter;
    return matchesSearch && matchesDept && matchesSem;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Email', 'Department', 'Semester', 'CGPA', 'Attendance Rate', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.rollNo,
      `"${s.name}"`,
      s.email,
      `"${s.department}"`,
      s.semester,
      s.cgpa,
      `${s.attendanceRate || 0}%`,
      s.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StudentTrack_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Fetching college administrative records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-slate-700">
          <i className="bi bi-check-circle-fill text-emerald-400"></i>
          {toastMessage}
        </div>
      )}

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'dashboard' && data && (
        <>
          {/* Top Bar Greeting */}
          <div className="d-flex flex-column flex-md-row md:items-center justify-between gap-3 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-5 text-white shadow-xs">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-full text-[11px] font-semibold text-blue-200 mb-2">
                <i className="bi bi-shield-check text-emerald-400"></i> System Administrator Control Panel
              </div>
              <h2 className="text-xl font-black tracking-tight mb-0.5">College Academic Overview</h2>
              <p className="text-xs text-blue-200 mb-0">
                Real-time metrics calculated from MongoDB records for all academic departments.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => {
                  setSelectedStudentForEdit(null);
                  setIsStudentModalOpen(true);
                }}
                className="btn btn-sm btn-primary bg-blue-500 hover:bg-blue-400 border-0 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-xs"
              >
                <i className="bi bi-person-plus-fill me-1"></i> Add Student
              </button>
            </div>
          </div>

          {/* 4 Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="st-card p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 d-flex align-items-center justify-content-center">
                  <i className="bi bi-people-fill text-lg"></i>
                </span>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="text-2xl font-black text-slate-900 mb-0">{data.metrics.totalStudents}</h3>
                <span className="text-xs text-emerald-600 font-semibold">Active Enrolled</span>
              </div>
              <div className="text-[11px] text-slate-400">Across 4 Engineering Depts</div>
            </div>

            {/* Card 2 */}
            <div className="st-card p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Members</span>
                <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 d-flex align-items-center justify-content-center">
                  <i className="bi bi-person-badge-fill text-lg"></i>
                </span>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="text-2xl font-black text-slate-900 mb-0">{data.metrics.totalFaculty}</h3>
                <span className="text-xs text-slate-500 font-medium">Professors & Mentors</span>
              </div>
              <div className="text-[11px] text-slate-400">1:8 Faculty-Student Ratio</div>
            </div>

            {/* Card 3 */}
            <div className="st-card p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Attendance</span>
                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 d-flex align-items-center justify-content-center">
                  <i className="bi bi-calendar-check-fill text-lg"></i>
                </span>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="text-2xl font-black text-slate-900 mb-0">{data.metrics.avgAttendance}%</h3>
                <span className="badge bg-emerald-100 text-emerald-700 text-[10px] font-bold">Good Standing</span>
              </div>
              <div className="text-[11px] text-slate-400">Threshold: 75% minimum</div>
            </div>

            {/* Card 4 */}
            <div className="st-card p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average CGPA</span>
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 d-flex align-items-center justify-content-center">
                  <i className="bi bi-award-fill text-lg"></i>
                </span>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="text-2xl font-black text-slate-900 mb-0">{data.metrics.avgCgpa}</h3>
                <span className="text-xs text-slate-500 font-medium">Out of 10.0</span>
              </div>
              <div className="text-[11px] text-slate-400">Semester 4 Mid-Term Benchmarks</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Trend Line Chart */}
            <div className="st-card p-5">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 className="text-sm font-bold text-slate-900 mb-0.5">Instructional Attendance Trends</h5>
                  <p className="text-xs text-slate-500 mb-0">Daily classroom present percentages (Chart.js)</p>
                </div>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle text-[11px]">
                  Daily Logs
                </span>
              </div>
              <ChartComponent
                type="line"
                labels={data.attendanceTrend.labels.map((d) => d.slice(5))}
                data={data.attendanceTrend.values}
                label="Attendance Rate (%)"
                height={230}
              />
            </div>

            {/* Academic Grade Distribution Bar Chart */}
            <div className="st-card p-5">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 className="text-sm font-bold text-slate-900 mb-0.5">Academic Performance & Grades</h5>
                  <p className="text-xs text-slate-500 mb-0">Exam result grade breakdown across students</p>
                </div>
                <span className="badge bg-indigo-subtle text-indigo-700 border border-indigo-subtle text-[11px]">
                  Letter Grades
                </span>
              </div>
              <ChartComponent
                type="bar"
                labels={data.gradeDistribution.labels}
                data={data.gradeDistribution.values}
                label="Number of Students"
                height={230}
              />
            </div>
          </div>

          {/* Department Breakdown + Attendance Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Doughnut Chart: Department Distribution */}
            <div className="st-card p-5">
              <h5 className="text-sm font-bold text-slate-900 mb-0.5">Department Enrollment</h5>
              <p className="text-xs text-slate-500 mb-3">Student distribution by branch</p>
              <ChartComponent
                type="doughnut"
                labels={data.departmentDistribution.labels}
                data={data.departmentDistribution.values}
                label="Students"
                height={200}
              />
            </div>

            {/* Defaulter / Attendance Alerts */}
            <div className="st-card p-5 lg:col-span-2">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 className="text-sm font-bold text-slate-900 mb-0.5 flex items-center gap-2">
                    <span>Attendance Shortage Alerts (&lt;75%)</span>
                    {attendanceSummary?.defaultersCount > 0 && (
                      <span className="badge bg-danger text-[10px]">
                        {attendanceSummary.defaultersCount} Action Required
                      </span>
                    )}
                  </h5>
                  <p className="text-xs text-slate-500 mb-0">Students currently below statutory eligibility threshold</p>
                </div>
              </div>

              {attendanceSummary?.defaulters && attendanceSummary.defaulters.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0 text-xs">
                    <thead className="table-light text-slate-600 font-bold">
                      <tr>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Department</th>
                        <th className="text-center">Attended / Total</th>
                        <th className="text-center">Current %</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceSummary.defaulters.map((d: any, idx: number) => (
                        <tr key={idx}>
                          <td className="font-mono font-bold text-red-600">{d.rollNo}</td>
                          <td className="font-semibold text-slate-900">{d.name}</td>
                          <td>{d.department}</td>
                          <td className="text-center font-mono">
                            {d.attendedClasses} / {d.totalClasses}
                          </td>
                          <td className="text-center">
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle font-bold">
                              {d.rate}%
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              onClick={() => setViewingStudentRoll(d.rollNo)}
                              className="btn btn-xs btn-outline-secondary py-0.5 px-2 text-[11px]"
                            >
                              Inspect Log
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <i className="bi bi-check-circle-fill text-emerald-500 text-2xl d-block mb-1"></i>
                  <span className="text-xs">All enrolled students are above the 75% attendance threshold!</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: STUDENT MANAGEMENT */}
      {(activeTab === 'students' || activeTab === 'dashboard') && (
        <div className="st-card p-5">
          <div className="d-flex flex-column flex-md-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 mb-0.5">Student Records Directory</h4>
              <p className="text-xs text-slate-500 mb-0">
                Manage student profiles, performance metrics, and MongoDB collections.
              </p>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
              >
                <i className="bi bi-file-earmark-arrow-down"></i> Export CSV
              </button>
              <button
                onClick={() => {
                  setSelectedStudentForEdit(null);
                  setIsStudentModalOpen(true);
                }}
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
              >
                <i className="bi bi-plus-lg"></i> Add Student
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="row g-2 mb-4">
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white text-slate-400 border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 text-xs"
                  placeholder="Search by name, roll no, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm text-xs"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm text-xs"
                value={semFilter}
                onChange={(e) => setSemFilter(e.target.value)}
              >
                <option value="All">All Semesters</option>
                <option value="2">Semester 2</option>
                <option value="4">Semester 4</option>
                <option value="6">Semester 6</option>
              </select>
            </div>

            <div className="col-12 col-md-2 text-end">
              <span className="text-xs text-slate-500 font-semibold leading-8">
                Showing {filteredStudents.length} of {students.length}
              </span>
            </div>
          </div>

          {/* Student Table */}
          <div className="table-responsive border border-slate-200 rounded-xl overflow-hidden">
            <table className="table table-hover align-middle mb-0 text-xs">
              <thead className="table-light text-slate-700 font-bold border-bottom">
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Department & Sem</th>
                  <th className="text-center">CGPA</th>
                  <th className="text-center">Attendance</th>
                  <th>Mentor</th>
                  <th className="text-center">Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => {
                    const attRate = s.attendanceRate ?? 100;
                    return (
                      <tr key={s._id}>
                        <td>
                          <button
                            onClick={() => setViewingStudentRoll(s.rollNo)}
                            className="font-mono font-bold text-blue-600 hover:underline bg-transparent border-0 p-0 text-start"
                          >
                            {s.rollNo}
                          </button>
                        </td>
                        <td>
                          <div className="font-semibold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-400">{s.email}</div>
                        </td>
                        <td>
                          <div className="text-slate-800">{s.department}</div>
                          <div className="text-[11px] text-slate-400">Sem {s.semester} • {s.batch}</div>
                        </td>
                        <td className="text-center">
                          <span className="font-black text-slate-900">{s.cgpa || '0.00'}</span>
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              attRate >= 75
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            } font-mono`}
                          >
                            {attRate}%
                          </span>
                        </td>
                        <td className="text-slate-600 truncate max-w-[120px]">{s.advisor}</td>
                        <td className="text-center">
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            {s.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => onOpenReportCard(s.rollNo)}
                              className="btn btn-light border text-slate-600"
                              title="Official Transcript"
                            >
                              <i className="bi bi-file-earmark-text"></i>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStudentForEdit(s);
                                setIsStudentModalOpen(true);
                              }}
                              className="btn btn-light border text-blue-600"
                              title="Edit Student"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s)}
                              className="btn btn-light border text-red-600"
                              title="Delete Record"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-slate-400">
                      No student records matched the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FACULTY DIRECTORY */}
      {activeTab === 'faculty' && (
        <div className="st-card p-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 mb-0.5">Faculty Members Directory</h4>
              <p className="text-xs text-slate-500 mb-0">College professors, department heads, and academic mentors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculty.map((f) => (
              <div key={f._id} className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-lg border border-indigo-100">
                    {f.name.replace('Dr. ', '').replace('Prof. ', '').charAt(0)}
                  </div>
                  <div>
                    <h6 className="font-bold text-slate-900 text-sm mb-0.5">{f.name}</h6>
                    <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                      {f.facultyCode}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-slate-600 mb-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Designation & Department</span>
                    <span className="font-semibold text-slate-800">
                      {f.designation} • {f.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contact</span>
                    <span className="font-mono text-[11px] text-blue-600">{f.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cabin / Office</span>
                    <span>{f.cabin}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Assigned Courses</span>
                  <div className="flex flex-wrap gap-1">
                    {f.subjects.map((sub, i) => (
                      <span key={i} className="badge bg-slate-100 text-slate-700 border text-[10px]">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Add/Edit Modal */}
      {isStudentModalOpen && (
        <StudentModal
          student={selectedStudentForEdit}
          onSave={handleSaveStudent}
          onClose={() => {
            setIsStudentModalOpen(false);
            setSelectedStudentForEdit(null);
          }}
        />
      )}

      {/* Student Details Inspection Drawer/Modal */}
      {viewingStudentRoll && (
        <StudentDetailsModal
          rollNo={viewingStudentRoll}
          onClose={() => setViewingStudentRoll(null)}
          onOpenReportCard={(roll) => {
            setViewingStudentRoll(null);
            onOpenReportCard(roll);
          }}
        />
      )}
    </div>
  );
};
