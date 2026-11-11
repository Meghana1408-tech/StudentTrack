import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.ts';
import { Student } from '../models/Student.ts';
import { Faculty } from '../models/Faculty.ts';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth.ts';
import { seedDatabase } from '../seedData.ts';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      studentRollNo: user.studentRollNo,
      facultyCode: user.facultyCode,
      department: user.department,
    };

    const token = generateToken(payload);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: payload,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
});

// POST /api/auth/quick-login (Demo Helper for Examiner/Evaluator)
router.post('/quick-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    let targetEmail = 'admin@studenttrack.edu';

    if (role === 'faculty') {
      targetEmail = 'faculty@studenttrack.edu';
    } else if (role === 'student') {
      targetEmail = 'student@studenttrack.edu';
    }

    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      res.status(404).json({ success: false, message: `Demo user for role ${role} not found` });
      return;
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      studentRollNo: user.studentRollNo,
      facultyCode: user.facultyCode,
      department: user.department,
    };

    const token = generateToken(payload);

    res.json({
      success: true,
      message: `Switched session to ${user.name} (${user.role.toUpperCase()})`,
      token,
      user: payload,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let extraProfile: any = null;
    if (user.role === 'student' && user.studentRollNo) {
      extraProfile = await Student.findOne({ rollNo: user.studentRollNo });
    } else if (user.role === 'faculty' && user.facultyCode) {
      extraProfile = await Faculty.findOne({ facultyCode: user.facultyCode });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentRollNo: user.studentRollNo,
        facultyCode: user.facultyCode,
        avatar: user.avatar,
        profile: extraProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/seed-reset
router.post('/seed-reset', async (req: Request, res: Response): Promise<void> => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'Database refreshed and re-seeded with sample college data!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
