import express, { Response } from 'express';
import { Student } from '../models/Student.ts';
import { Mark } from '../models/Mark.ts';
import { Attendance } from '../models/Attendance.ts';
import { Course } from '../models/Course.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET /api/reports/student/:rollNo - Consolidated academic report card
router.get('/student/:rollNo', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rollNo = req.params.rollNo.toUpperCase();
    const student = await Student.findOne({ rollNo });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const marks = await Mark.find({ studentRollNo: rollNo }).sort({ courseCode: 1 });
    const attendanceRecords = await Attendance.find({ 'records.rollNo': rollNo });

    let totalClasses = 0;
    let attendedScore = 0;
    const courseAttendanceMap: Record<string, { total: number; attended: number }> = {};

    attendanceRecords.forEach((sess) => {
      const rec = sess.records.find((r) => r.rollNo === rollNo);
      if (rec) {
        totalClasses++;
        if (!courseAttendanceMap[sess.courseCode]) {
          courseAttendanceMap[sess.courseCode] = { total: 0, attended: 0 };
        }
        courseAttendanceMap[sess.courseCode].total++;
        if (rec.status === 'Present') {
          attendedScore += 1;
          courseAttendanceMap[sess.courseCode].attended += 1;
        } else if (rec.status === 'Late') {
          attendedScore += 0.5;
          courseAttendanceMap[sess.courseCode].attended += 0.5;
        }
      }
    });

    const attendanceRate = totalClasses > 0 ? Math.round((attendedScore / totalClasses) * 100) : 100;

    // Calculate overall percentage and GPA
    const totalMarksObtained = marks.reduce((acc, m) => acc + m.marksObtained, 0);
    const maxMarksPossible = marks.reduce((acc, m) => acc + m.maxMarks, 0);
    const averageScore = maxMarksPossible > 0 ? Math.round((totalMarksObtained / maxMarksPossible) * 100) : 0;

    // Compile courses
    const courses = await Course.find({ semester: student.semester, department: student.department });

    res.json({
      success: true,
      data: {
        student,
        academicYear: '2026-2027',
        reportDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        attendance: {
          totalClasses,
          attendedScore,
          rate: attendanceRate,
          isDefaulter: attendanceRate < 75,
          byCourse: courseAttendanceMap,
        },
        marks: {
          records: marks,
          totalObtained: totalMarksObtained,
          maxPossible: maxMarksPossible,
          averagePercentage: averageScore,
        },
        courses,
        institution: {
          name: 'Institute of Engineering & Technology',
          accreditation: 'Affiliated to National University | AICTE Approved',
          term: 'Semester Examination & Academic Assessment',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
