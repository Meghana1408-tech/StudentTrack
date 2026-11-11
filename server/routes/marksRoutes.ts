import express, { Response } from 'express';
import { Mark } from '../models/Mark.ts';
import { Student } from '../models/Student.ts';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'P';
  return 'F';
}

// GET /api/marks - Filter marks by course, examType, semester
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseCode, examType, semester, studentRollNo } = req.query;
    const filter: any = {};

    if (courseCode && courseCode !== 'All') filter.courseCode = String(courseCode).toUpperCase();
    if (examType && examType !== 'All') filter.examType = examType;
    if (semester && semester !== 'All') filter.semester = Number(semester);
    if (studentRollNo) filter.studentRollNo = String(studentRollNo).toUpperCase();

    const marks = await Mark.find(filter).sort({ courseCode: 1, studentRollNo: 1 });
    res.json({ success: true, count: marks.length, data: marks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/marks/student/:rollNo - Get full grade sheet of a student
router.get('/student/:rollNo', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rollNo = req.params.rollNo.toUpperCase();
    const marks = await Mark.find({ studentRollNo: rollNo }).sort({ semester: 1, courseCode: 1 });

    const totalMarks = marks.reduce((acc, m) => acc + m.marksObtained, 0);
    const maxPossible = marks.reduce((acc, m) => acc + m.maxMarks, 0);
    const overallPercentage = maxPossible > 0 ? Math.round((totalMarks / maxPossible) * 100) : 0;

    res.json({
      success: true,
      data: {
        studentRollNo: rollNo,
        count: marks.length,
        totalMarks,
        maxPossible,
        overallPercentage,
        marks,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/marks - Single student mark entry/update
router.post('/', authenticateToken, requireRole('admin', 'faculty'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentRollNo, courseCode, courseName, examType, marksObtained, maxMarks = 100, remarks } = req.body;

    if (!studentRollNo || !courseCode || !examType || marksObtained === undefined) {
      res.status(400).json({ success: false, message: 'Missing required exam score fields' });
      return;
    }

    const student = await Student.findOne({ rollNo: studentRollNo.toUpperCase() });
    if (!student) {
      res.status(404).json({ success: false, message: `Student with roll ${studentRollNo} not found` });
      return;
    }

    const score = Number(marksObtained);
    const max = Number(maxMarks) || 100;
    const percentage = Math.round((score / max) * 100);
    const grade = calculateGrade(percentage);

    const mark = await Mark.findOneAndUpdate(
      {
        studentRollNo: student.rollNo,
        courseCode: courseCode.toUpperCase(),
        examType,
      },
      {
        studentRollNo: student.rollNo,
        studentName: student.name,
        courseCode: courseCode.toUpperCase(),
        courseName: courseName || courseCode,
        department: student.department,
        semester: student.semester,
        examType,
        marksObtained: score,
        maxMarks: max,
        percentage,
        grade,
        remarks: remarks || '',
        enteredBy: req.user?.name || 'Faculty',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Marks recorded successfully', data: mark });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/marks/bulk - Batch enter examination marks for a class
router.post('/bulk', authenticateToken, requireRole('admin', 'faculty'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseCode, courseName, examType, maxMarks = 100, entries } = req.body;

    if (!courseCode || !examType || !Array.isArray(entries)) {
      res.status(400).json({ success: false, message: 'Invalid bulk marks submission payload' });
      return;
    }

    const max = Number(maxMarks) || 100;
    const results = [];

    for (const item of entries) {
      if (item.studentRollNo && item.marksObtained !== undefined && item.marksObtained !== '') {
        const score = Number(item.marksObtained);
        const percentage = Math.round((score / max) * 100);
        const grade = calculateGrade(percentage);

        const saved = await Mark.findOneAndUpdate(
          {
            studentRollNo: item.studentRollNo.toUpperCase(),
            courseCode: courseCode.toUpperCase(),
            examType,
          },
          {
            studentRollNo: item.studentRollNo.toUpperCase(),
            studentName: item.studentName || item.studentRollNo,
            courseCode: courseCode.toUpperCase(),
            courseName: courseName || courseCode,
            department: item.department || 'Computer Science',
            semester: item.semester || 4,
            examType,
            marksObtained: score,
            maxMarks: max,
            percentage,
            grade,
            remarks: item.remarks || '',
            enteredBy: req.user?.name || 'Faculty',
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        results.push(saved);
      }
    }

    res.json({
      success: true,
      message: `Successfully processed marks for ${results.length} students in ${courseCode} (${examType})`,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
