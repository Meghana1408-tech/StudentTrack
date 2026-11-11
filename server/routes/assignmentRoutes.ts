import express, { Response } from 'express';
import { Assignment } from '../models/Assignment.ts';
import { Submission } from '../models/Submission.ts';
import { Course } from '../models/Course.ts';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET /api/assignments - List assignments
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseCode, semester, status } = req.query;
    const filter: any = {};

    if (courseCode && courseCode !== 'All') filter.courseCode = String(courseCode).toUpperCase();
    if (semester && semester !== 'All') filter.semester = Number(semester);
    if (status && status !== 'All') filter.status = status;

    const assignments = await Assignment.find(filter).sort({ dueDate: 1 });

    // Include submission stats
    const withStats = await Promise.all(
      assignments.map(async (ass) => {
        const submissionsCount = await Submission.countDocuments({ assignmentId: ass._id });
        const gradedCount = await Submission.countDocuments({ assignmentId: ass._id, status: 'Graded' });

        // If current user is a student, check if they have submitted
        let mySubmission: any = null;
        if (req.user?.role === 'student' && req.user?.studentRollNo) {
          mySubmission = await Submission.findOne({
            assignmentId: ass._id,
            studentRollNo: req.user.studentRollNo,
          });
        }

        return {
          ...ass.toObject(),
          submissionsCount,
          gradedCount,
          mySubmission,
        };
      })
    );

    res.json({ success: true, count: withStats.length, data: withStats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/assignments/:id - Assignment details with submissions
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    let submissions: any[] = [];
    if (req.user?.role === 'faculty' || req.user?.role === 'admin') {
      submissions = await Submission.find({ assignmentId: assignment._id }).sort({ submittedAt: -1 });
    } else if (req.user?.role === 'student' && req.user?.studentRollNo) {
      const mySub = await Submission.findOne({
        assignmentId: assignment._id,
        studentRollNo: req.user.studentRollNo,
      });
      if (mySub) submissions = [mySub];
    }

    res.json({
      success: true,
      data: {
        ...assignment.toObject(),
        submissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/assignments - Create assignment (Faculty or Admin)
router.post('/', authenticateToken, requireRole('admin', 'faculty'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, courseCode, semester, dueDate, maxMarks = 20, description, department } = req.body;

    if (!title || !courseCode || !dueDate) {
      res.status(400).json({ success: false, message: 'Title, course code, and due date are required' });
      return;
    }

    const course = await Course.findOne({ code: courseCode.toUpperCase() });

    const newAssignment = await Assignment.create({
      title: title.trim(),
      courseCode: courseCode.toUpperCase(),
      courseName: course ? course.title : courseCode,
      department: department || course?.department || 'Computer Science',
      semester: Number(semester) || 4,
      facultyName: req.user?.name || 'Faculty Member',
      facultyEmail: req.user?.email || '',
      description: description || '',
      dueDate,
      maxMarks: Number(maxMarks) || 20,
      status: 'Open',
    });

    res.status(201).json({ success: true, message: 'Assignment created successfully', data: newAssignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/assignments/:id/submit - Student submit assignment
router.post('/:id/submit', authenticateToken, requireRole('student'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    const rollNo = req.user?.studentRollNo;
    const name = req.user?.name || 'Student';
    const { answerText, fileAttachment } = req.body;

    if (!rollNo) {
      res.status(400).json({ success: false, message: 'User is not linked to a student roll number' });
      return;
    }

    const submission = await Submission.findOneAndUpdate(
      {
        assignmentId: assignment._id,
        studentRollNo: rollNo,
      },
      {
        assignmentId: assignment._id,
        studentRollNo: rollNo,
        studentName: name,
        submittedAt: new Date().toISOString(),
        answerText: answerText || 'Student submitted work',
        fileAttachment: fileAttachment || '',
        status: 'Submitted',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Assignment submitted successfully!', data: submission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/assignments/submissions/:submissionId/grade - Faculty grade submission
router.post('/submissions/:submissionId/grade', authenticateToken, requireRole('admin', 'faculty'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { marksAwarded, feedback } = req.body;
    const { submissionId } = req.params;

    if (marksAwarded === undefined) {
      res.status(400).json({ success: false, message: 'Marks awarded is required' });
      return;
    }

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        marksAwarded: Number(marksAwarded),
        feedback: feedback || '',
        status: 'Graded',
        gradedBy: req.user?.name || 'Faculty Evaluator',
      },
      { new: true }
    );

    if (!submission) {
      res.status(404).json({ success: false, message: 'Submission record not found' });
      return;
    }

    res.json({ success: true, message: 'Submission graded successfully', data: submission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
