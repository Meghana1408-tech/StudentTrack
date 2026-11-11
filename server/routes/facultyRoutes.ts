import express, { Response } from 'express';
import { Faculty } from '../models/Faculty.ts';
import { Course } from '../models/Course.ts';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET /api/faculty - List all faculty members
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department } = req.query;
    const filter: any = {};
    if (department && department !== 'All') {
      filter.department = department;
    }

    const faculty = await Faculty.find(filter).sort({ name: 1 });
    res.json({ success: true, count: faculty.length, data: faculty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/faculty/courses - List courses
router.get('/courses', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courses = await Course.find().sort({ semester: 1, code: 1 });
    res.json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/faculty - Add faculty member (Admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { facultyCode, name, email, department, designation, subjects, phone, cabin } = req.body;
    if (!facultyCode || !name || !email || !department || !designation) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const newFaculty = await Faculty.create({
      facultyCode: facultyCode.toUpperCase().trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department,
      designation,
      subjects: Array.isArray(subjects) ? subjects : [subjects].filter(Boolean),
      phone: phone || '',
      cabin: cabin || 'Faculty Block',
    });

    res.status(201).json({ success: true, message: 'Faculty added successfully', data: newFaculty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
