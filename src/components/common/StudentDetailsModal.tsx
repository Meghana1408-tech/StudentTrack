import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';

interface StudentDetailsModalProps {
  rollNo: string;
  onClose: () => void;
  onOpenReportCard: (rollNo: string) => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  rollNo,
  onClose,
  onOpenReportCard,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getStudentProfile(rollNo);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch student details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rollNo]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 my-6">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 p-1.5 rounded-lg text-white">
              <i className="bi bi-person-badge-fill"></i>
            </span>
            <h5 className="font-bold text-sm tracking-wide mb-0">Student Profile & Academic Log</h5>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-outline-light px-2 py-0.5 rounded-lg">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="text-xs text-slate-500 mt-2">Loading student records from MongoDB...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-xs">{error}</div>
          ) : data ? (
            <div>
              {/* Header profile bio */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                    {data.name?.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-base mb-0.5">{data.name}</h5>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                        {data.rollNo}
                      </span>
                      <span className="text-slate-600">{data.department}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">Semester {data.semester}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenReportCard(data.rollNo)}
                    className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                  >
                    <i className="bi bi-file-earmark-text"></i> View Transcript
                  </button>
                </div>
              </div>

              {/* Key KPI Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-slate-500 text-[11px] block">Cumulative CGPA</span>
                  <span className="text-lg font-black text-emerald-600">{data.cgpa || '0.00'}</span>
                  <span className="text-[10px] text-slate-400 block">Out of 10.0</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-slate-500 text-[11px] block">Attendance Rate</span>
                  <span
                    className={`text-lg font-black ${
                      (data.attendanceRate || 0) >= 75 ? 'text-blue-700' : 'text-red-600'
                    }`}
                  >
                    {data.attendanceRate || 0}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {data.attendedClasses || 0} / {data.totalClasses || 0} classes
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-slate-500 text-[11px] block">Academic Batch</span>
                  <span className="text-sm font-bold text-slate-800">{data.batch}</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">{data.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-slate-500 text-[11px] block">Faculty Mentor</span>
                  <span className="text-xs font-bold text-slate-800 truncate block">{data.advisor}</span>
                  <span className="text-[10px] text-slate-400 block">Academic Mentor</span>
                </div>
              </div>

              {/* Course Attendance Breakdown */}
              <div className="mb-6">
                <h6 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-3">
                  Course Attendance Performance
                </h6>
                <div className="space-y-2">
                  {data.courseBreakdown && data.courseBreakdown.length > 0 ? (
                    data.courseBreakdown.map((c: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-bold text-slate-800">
                            {c.courseCode} - {c.courseTitle}
                          </span>
                          <span
                            className={`font-bold ${
                              c.rate >= 75 ? 'text-blue-700' : 'text-red-600'
                            }`}
                          >
                            {c.rate}% ({c.attended}/{c.total})
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className={`progress-bar ${
                              c.rate >= 75 ? 'bg-primary' : 'bg-danger'
                            }`}
                            style={{ width: `${c.rate}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No attendance records logged yet.</p>
                  )}
                </div>
              </div>

              {/* Examination Scores */}
              <div>
                <h6 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-3">
                  Examination Records
                </h6>
                <div className="table-responsive border border-slate-200 rounded-lg overflow-hidden">
                  <table className="table table-sm table-hover mb-0 text-xs">
                    <thead className="table-light text-slate-600 font-bold">
                      <tr>
                        <th>Subject</th>
                        <th>Exam</th>
                        <th className="text-center">Score</th>
                        <th className="text-center">Grade</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.marks && data.marks.length > 0 ? (
                        data.marks.map((m: any, i: number) => (
                          <tr key={i}>
                            <td className="font-semibold text-slate-800">
                              {m.courseCode} - {m.courseName}
                            </td>
                            <td>
                              <span className="badge bg-slate-100 text-slate-700 border">
                                {m.examType}
                              </span>
                            </td>
                            <td className="text-center font-bold">
                              {m.marksObtained}/{m.maxMarks}
                            </td>
                            <td className="text-center">
                              <span className="badge bg-primary font-mono">{m.grade}</span>
                            </td>
                            <td className="text-slate-500 italic text-[11px]">{m.remarks || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-3 text-slate-400">
                            No marks registered yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
