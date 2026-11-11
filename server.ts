import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './server/db.ts';
import { seedDatabase } from './server/seedData.ts';
import authRoutes from './server/routes/authRoutes.ts';
import studentRoutes from './server/routes/studentRoutes.ts';
import facultyRoutes from './server/routes/facultyRoutes.ts';
import attendanceRoutes from './server/routes/attendanceRoutes.ts';
import marksRoutes from './server/routes/marksRoutes.ts';
import assignmentRoutes from './server/routes/assignmentRoutes.ts';
import dashboardRoutes from './server/routes/dashboardRoutes.ts';
import reportRoutes from './server/routes/reportRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'StudentTrack - College PBL Tracker',
    database: 'MongoDB (Mongoose)',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Seed initial college data
    await seedDatabase();

    // 3. Integrate Vite middleware in development
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware mounted in development mode.');
    } else {
      const distPath = path.resolve(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
      console.log(`Serving production build from ${distPath}`);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 StudentTrack Server is running on port ${PORT}`);
      console.log(`🌐 Local URL: http://localhost:${PORT}`);
      console.log(`📚 Node.js + Express.js + MongoDB + Mongoose + Chart.js`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting StudentTrack server:', error);
    process.exit(1);
  }
}

startServer();
