import express, { Response } from 'express';
import { Attendance } from '../models/Attendance.ts';
import { Student } from '../models/Student.ts';
import { Course } from '../models/Course.ts';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET /api/attendance/summary - College/Department wide attendance summary & statistics
router.get('/summary', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allSessions = await Attendance.find().sort({ date: 1 });
    const students = await Student.find();

    let totalAttendanceEntries = 0;
    let totalPresentEntries = 0;

    const studentMap: Record<string, { total: number; attended: number }> = {};
    students.forEach((s) => {
      studentMap[s.rollNo] = { total: 0, attended: 0 };
    });

    const dateSessionMap: Record<string, { present: number; total: number }> = {};

    allSessions.forEach((session) => {
      if (!dateSessionMap[session.date]) {
        dateSessionMap[session.date] = { present: 0, total: 0 };
      }

      session.records.forEach((rec) => {
        totalAttendanceEntries++;
        dateSessionMap[session.date].total++;

        if (studentMap[rec.rollNo]) {
          studentMap[rec.rollNo].total++;
        }

        if (rec.status === 'Present') {
          totalPresentEntries += 1;
          dateSessionMap[session.date].present += 1;
          if (studentMap[rec.rollNo]) studentMap[rec.rollNo].attended += 1;
        } else if (rec.status === 'Late') {
          totalPresentEntries += 0.5;
          dateSessionMap[session.date].present += 0.5;
          if (studentMap[rec.rollNo]) studentMap[rec.rollNo].attended += 0.5;
        }
      });
    });

    const overallPercentage =
      totalAttendanceEntries > 0 ? Math.round((totalPresentEntries / totalAttendanceEntries) * 100) : 90;

    // Defaulters (below 75% attendance threshold)
    const defaulters: any[] = [];
    students.forEach((stu) => {
      const stats = studentMap[stu.rollNo];
      if (stats && stats.total > 0) {
        const rate = Math.round((stats.attended / stats.total) * 100);
        if (rate < 75) {
          defaulters.push({
            rollNo: stu.rollNo,
            name: stu.name,
            department: stu.department,
            semester: stu.semester,
            totalClasses: stats.total,
            attendedClasses: stats.attended,
            rate,
          });
        }
      }
    });

    // Date-wise trend data for Chart.js
    const trendLabels = Object.keys(dateSessionMap).sort();
    const trendValues = trendLabels.map((date) => {
      const item = dateSessionMap[date];
      return item.total > 0 ? Math.round((item.present / item.total) * 100) : 100;
    });

    res.json({
      success: true,
      data: {
        overallPercentage,
        totalSessionsCount: allSessions.length,
        totalEntriesRecorded: totalAttendanceEntries,
        defaultersCount: defaulters.length,
        defaulters,
        trend: {
          labels: trendLabels,
          values: trendValues,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/session - Retrieve specific session records
router.get('/session', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, courseCode, semester } = req.query;

    if (!date || !courseCode) {
      res.status(400).json({ success: false, message: 'Date and courseCode are required' });
      return;
    }

    const session = await Attendance.findOne({
      date: String(date),
      courseCode: String(courseCode).toUpperCase(),
    });

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/student/:rollNo - Get all attendance logs for a specific student
router.get('/student/:rollNo', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rollNo = req.params.rollNo.toUpperCase();
    const sessions = await Attendance.find({ 'records.rollNo': rollNo }).sort({ date: -1 });

    let total = 0;
    let present = 0;
    let late = 0;
    let absent = 0;

    const courseMap: Record<string, { title: string; total: number; attended: number }> = {};

    const history = sessions.map((sess) => {
      const rec = sess.records.find((r) => r.rollNo === rollNo);
      const status = rec ? rec.status : 'Absent';

      total++;
      if (status === 'Present') present++;
      else if (status === 'Late') late++;
      else absent++;

      if (!courseMap[sess.courseCode]) {
        courseMap[sess.courseCode] = { title: sess.courseName, total: 0, attended: 0 };
      }
      courseMap[sess.courseCode].total++;
      if (status === 'Present') courseMap[sess.courseCode].attended += 1;
      else if (status === 'Late') courseMap[sess.courseCode].attended += 0.5;

      return {
        date: sess.date,
        courseCode: sess.courseCode,
        courseName: sess.courseName,
        facultyName: sess.facultyName,
        status,
      };
    });

    const attendedScore = present + late * 0.5;
    const rate = total > 0 ? Math.round((attendedScore / total) * 100) : 100;

    const courseBreakdown = Object.entries(courseMap).map(([code, item]) => ({
      courseCode: code,
      courseTitle: item.title,
      totalClasses: item.total,
      attendedClasses: item.attended,
      percentage: item.total > 0 ? Math.round((item.attended / item.total) * 100) : 100,
    }));

    res.json({
      success: true,
      data: {
        rollNo,
        overallRate: rate,
        totalClasses: total,
        presentCount: present,
        lateCount: late,
        absentCount: absent,
        isDefaulter: rate < 75,
        courseBreakdown,
        history,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/attendance/mark - Mark or update attendance for a class session
router.post('/mark', authenticateToken, requireRole('admin', 'faculty'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, courseCode, semester, department, records } = req.body;

    if (!date || !courseCode || !records || !Array.isArray(records)) {
      res.status(400).json({ success: false, message: 'Invalid attendance payload' });
      return;
    }

    const course = await Course.findOne({ code: courseCode.toUpperCase() });
    const courseName = course ? course.title : courseCode;
    const facultyName = req.user?.name || 'Faculty Instructor';

    const cleanRecords = records.map((r: any) => ({
      rollNo: String(r.rollNo).toUpperCase().trim(),
      studentName: String(r.studentName).trim(),
      status: ['Present', 'Absent', 'Late'].includes(r.status) ? r.status : 'Present',
    }));

    const updated = await Attendance.findOneAndUpdate(
      {
        date,
        courseCode: courseCode.toUpperCase(),
        semester: Number(semester) || 4,
      },
      {
        date,
        courseCode: courseCode.toUpperCase(),
        courseName,
        department: department || 'Computer Science',
        semester: Number(semester) || 4,
        facultyName,
        records: cleanRecords,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: `Attendance marked successfully for ${courseCode} on ${date} (${cleanRecords.length} students)`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
