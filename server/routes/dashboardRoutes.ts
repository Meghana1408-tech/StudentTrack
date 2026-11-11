import express, { Response } from 'express';
import { Student } from '../models/Student.ts';
import { Faculty } from '../models/Faculty.ts';
import { Attendance } from '../models/Attendance.ts';
import { Mark } from '../models/Mark.ts';
import { Assignment } from '../models/Assignment.ts';
import { Submission } from '../models/Submission.ts';
import { Course } from '../models/Course.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET /api/dashboard/admin
router.get('/admin', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalAssignments = await Assignment.countDocuments();

    // CGPA statistics
    const students = await Student.find();
    const totalCgpa = students.reduce((acc, s) => acc + (s.cgpa || 0), 0);
    const avgCgpa = totalStudents > 0 ? (totalCgpa / totalStudents).toFixed(2) : '0.00';

    // Department distribution
    const departmentCounts: Record<string, number> = {};
    students.forEach((s) => {
      departmentCounts[s.department] = (departmentCounts[s.department] || 0) + 1;
    });

    // Attendance calculation
    const allSessions = await Attendance.find().sort({ date: 1 });
    let totalRecords = 0;
    let presentRecords = 0;
    const dateTrendMap: Record<string, { present: number; total: number }> = {};

    allSessions.forEach((sess) => {
      if (!dateTrendMap[sess.date]) {
        dateTrendMap[sess.date] = { present: 0, total: 0 };
      }
      sess.records.forEach((r) => {
        totalRecords++;
        dateTrendMap[sess.date].total++;
        if (r.status === 'Present') {
          presentRecords += 1;
          dateTrendMap[sess.date].present += 1;
        } else if (r.status === 'Late') {
          presentRecords += 0.5;
          dateTrendMap[sess.date].present += 0.5;
        }
      });
    });

    const avgAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 88;

    // Grade distribution
    const allMarks = await Mark.find();
    const gradeCounts: Record<string, number> = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'P': 0, 'F': 0 };
    allMarks.forEach((m) => {
      if (gradeCounts[m.grade] !== undefined) {
        gradeCounts[m.grade]++;
      }
    });

    // Attendance trends for Chart.js
    const trendDates = Object.keys(dateTrendMap).sort();
    const trendPercentages = trendDates.map((d) => {
      const item = dateTrendMap[d];
      return item.total > 0 ? Math.round((item.present / item.total) * 100) : 100;
    });

    res.json({
      success: true,
      data: {
        metrics: {
          totalStudents,
          totalFaculty,
          totalCourses,
          totalAssignments,
          avgCgpa,
          avgAttendance,
        },
        departmentDistribution: {
          labels: Object.keys(departmentCounts),
          values: Object.values(departmentCounts),
        },
        gradeDistribution: {
          labels: Object.keys(gradeCounts),
          values: Object.values(gradeCounts),
        },
        attendanceTrend: {
          labels: trendDates,
          values: trendPercentages,
        },
        recentStudents: students.slice(0, 5),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/faculty
router.get('/faculty', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const facultyName = req.user?.name || 'Dr. Robert Chen';
    const courses = await Course.find({ facultyName });
    const courseCodes = courses.map((c) => c.code);

    const students = await Student.find({ department: 'Computer Science', semester: 4 });
    const assignments = await Assignment.find({ facultyName });

    // Pending submissions to grade
    const assignmentIds = assignments.map((a) => a._id);
    const pendingSubmissions = await Submission.find({
      assignmentId: { $in: assignmentIds },
      status: 'Submitted',
    }).sort({ submittedAt: -1 });

    // Low attendance students (<75%)
    const allAttendance = await Attendance.find({ courseCode: { $in: courseCodes } });
    const studentAttendanceMap: Record<string, { total: number; attended: number; name: string }> = {};

    students.forEach((s) => {
      studentAttendanceMap[s.rollNo] = { total: 0, attended: 0, name: s.name };
    });

    allAttendance.forEach((sess) => {
      sess.records.forEach((r) => {
        if (studentAttendanceMap[r.rollNo]) {
          studentAttendanceMap[r.rollNo].total++;
          if (r.status === 'Present') studentAttendanceMap[r.rollNo].attended += 1;
          else if (r.status === 'Late') studentAttendanceMap[r.rollNo].attended += 0.5;
        }
      });
    });

    const lowAttendanceList: any[] = [];
    Object.entries(studentAttendanceMap).forEach(([rollNo, stats]) => {
      if (stats.total > 0) {
        const rate = Math.round((stats.attended / stats.total) * 100);
        if (rate < 75) {
          lowAttendanceList.push({
            rollNo,
            name: stats.name,
            attended: stats.attended,
            total: stats.total,
            rate,
          });
        }
      }
    });

    res.json({
      success: true,
      data: {
        facultyName,
        courses,
        totalStudentsCount: students.length,
        activeAssignmentsCount: assignments.filter((a) => a.status === 'Open').length,
        pendingGradingCount: pendingSubmissions.length,
        pendingSubmissions: pendingSubmissions.slice(0, 5),
        lowAttendanceAlerts: lowAttendanceList,
        students: students.slice(0, 10),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/student
router.get('/student', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rollNo = req.user?.studentRollNo || 'CS-2024-042';
    const student = await Student.findOne({ rollNo });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Attendance calculation
    const attendanceRecords = await Attendance.find({ 'records.rollNo': rollNo }).sort({ date: 1 });
    let totalClasses = 0;
    let attendedScore = 0;
    const subjectAttendance: Record<string, { title: string; total: number; attended: number }> = {};

    attendanceRecords.forEach((sess) => {
      const rec = sess.records.find((r) => r.rollNo === rollNo);
      if (rec) {
        totalClasses++;
        if (!subjectAttendance[sess.courseCode]) {
          subjectAttendance[sess.courseCode] = { title: sess.courseName, total: 0, attended: 0 };
        }
        subjectAttendance[sess.courseCode].total++;
        if (rec.status === 'Present') {
          attendedScore += 1;
          subjectAttendance[sess.courseCode].attended += 1;
        } else if (rec.status === 'Late') {
          attendedScore += 0.5;
          subjectAttendance[sess.courseCode].attended += 0.5;
        }
      }
    });

    const overallAttendance = totalClasses > 0 ? Math.round((attendedScore / totalClasses) * 100) : 92;

    const subjectStats = Object.entries(subjectAttendance).map(([code, item]) => ({
      code,
      title: item.title,
      total: item.total,
      attended: item.attended,
      rate: item.total > 0 ? Math.round((item.attended / item.total) * 100) : 100,
    }));

    // Marks & Results
    const marks = await Mark.find({ studentRollNo: rollNo }).sort({ createdAt: -1 });

    // Assignments & Submissions
    const assignments = await Assignment.find({ semester: student.semester }).sort({ dueDate: 1 });
    const submissions = await Submission.find({ studentRollNo: rollNo });

    const assignmentsWithStatus = assignments.map((ass) => {
      const sub = submissions.find((s) => s.assignmentId.toString() === ass._id.toString());
      return {
        ...ass.toObject(),
        submission: sub || null,
        isSubmitted: !!sub,
        isGraded: sub?.status === 'Graded',
        marksAwarded: sub?.marksAwarded,
      };
    });

    res.json({
      success: true,
      data: {
        student,
        overallAttendance,
        isAttendanceLow: overallAttendance < 75,
        totalClasses,
        subjectStats,
        marks,
        assignments: assignmentsWithStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
