import express, { Response } from 'express';
import { Student } from '../models/Student.ts';
import { Attendance } from '../models/Attendance.ts';
import { Mark } from '../models/Mark.ts';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET /api/students - List students with filter and search
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, department, semester, status, limit = 50 } = req.query;

    const query: any = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { rollNo: searchRegex },
        { email: searchRegex },
      ];
    }

    const students = await Student.find(query).sort({ rollNo: 1 }).limit(Number(limit));

    // Calculate quick attendance percentage for each student
    const allAttendance = await Attendance.find();
    const studentsWithMetrics = students.map((stu) => {
      let totalSessions = 0;
      let attendedSessions = 0;

      for (const att of allAttendance) {
        const record = att.records.find((r) => r.rollNo === stu.rollNo);
        if (record) {
          totalSessions++;
          if (record.status === 'Present') attendedSessions += 1;
          else if (record.status === 'Late') attendedSessions += 0.5;
        }
      }

      const attendanceRate = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 100;

      return {
        ...stu.toObject(),
        attendanceRate,
        totalClasses: totalSessions,
      };
    });

    res.json({ success: true, count: studentsWithMetrics.length, data: studentsWithMetrics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/:idOrRoll - Get single student details & academic profile
router.get('/:idOrRoll', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idOrRoll } = req.params;
    let student = null;

    if (idOrRoll.length === 24 && /^[0-9a-fA-F]+$/.test(idOrRoll)) {
      student = await Student.findById(idOrRoll);
    }

    if (!student) {
      student = await Student.findOne({ rollNo: idOrRoll.toUpperCase() });
    }

    if (!student) {
      res.status(404).json({ success: false, message: 'Student record not found' });
      return;
    }

    // Fetch student's marks
    const marks = await Mark.find({ studentRollNo: student.rollNo }).sort({ createdAt: -1 });

    // Fetch student's attendance history
    const attendanceRecords = await Attendance.find({
      'records.rollNo': student.rollNo,
    }).sort({ date: -1 });

    let totalClasses = 0;
    let attendedClasses = 0;
    const courseAttendanceMap: Record<string, { total: number; attended: number; title: string }> = {};

    attendanceRecords.forEach((att) => {
      const rec = att.records.find((r) => r.rollNo === student.rollNo);
      if (rec) {
        totalClasses++;
        if (!courseAttendanceMap[att.courseCode]) {
          courseAttendanceMap[att.courseCode] = { total: 0, attended: 0, title: att.courseName };
        }
        courseAttendanceMap[att.courseCode].total++;

        if (rec.status === 'Present') {
          attendedClasses += 1;
          courseAttendanceMap[att.courseCode].attended += 1;
        } else if (rec.status === 'Late') {
          attendedClasses += 0.5;
          courseAttendanceMap[att.courseCode].attended += 0.5;
        }
      }
    });

    const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

    const courseBreakdown = Object.entries(courseAttendanceMap).map(([code, stats]) => ({
      courseCode: code,
      courseTitle: stats.title,
      total: stats.total,
      attended: stats.attended,
      rate: stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 100,
    }));

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        attendanceRate,
        totalClasses,
        attendedClasses,
        courseBreakdown,
        marks,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/students - Add new student (Admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rollNo, name, email, department, semester, batch, phone, gender, cgpa, advisor, address } = req.body;

    if (!rollNo || !name || !email || !department || !semester) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const existing = await Student.findOne({ rollNo: rollNo.toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: `Student with roll number ${rollNo} already exists` });
      return;
    }

    const newStudent = await Student.create({
      rollNo: rollNo.toUpperCase().trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department,
      semester: Number(semester),
      batch: batch || '2024-2028',
      phone: phone || '',
      gender: gender || 'Male',
      cgpa: Number(cgpa) || 7.5,
      advisor: advisor || 'Dr. Robert Chen',
      address: address || '',
      status: 'Active',
    });

    res.status(201).json({ success: true, message: 'Student created successfully', data: newStudent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/students/:id - Update student (Admin or Faculty)
router.put('/:id', authenticateToken, requireRole('admin', 'faculty'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Student.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/students/:id - Delete student (Admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    // Clean up associated marks
    await Mark.deleteMany({ studentRollNo: deleted.rollNo });

    res.json({ success: true, message: `Student ${deleted.name} (${deleted.rollNo}) deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
