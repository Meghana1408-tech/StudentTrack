import bcrypt from 'bcryptjs';
import { User } from './models/User.ts';
import { Student } from './models/Student.ts';
import { Faculty } from './models/Faculty.ts';
import { Course } from './models/Course.ts';
import { Attendance } from './models/Attendance.ts';
import { Mark } from './models/Mark.ts';
import { Assignment } from './models/Assignment.ts';
import { Submission } from './models/Submission.ts';

export async function seedDatabase(force = false): Promise<void> {
  const userCount = await User.countDocuments();
  if (userCount > 0 && !force) {
    console.log('Database already contains records. Skipping seed.');
    return;
  }

  console.log('Clearing existing collections for fresh college PBL seed...');
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Faculty.deleteMany({}),
    Course.deleteMany({}),
    Attendance.deleteMany({}),
    Mark.deleteMany({}),
    Assignment.deleteMany({}),
    Submission.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('admin123', 10);
  const facultyHash = await bcrypt.hash('faculty123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  // 1. Seed Faculty
  const facultyList = [
    {
      facultyCode: 'FAC-CS-101',
      name: 'Dr. Robert Chen',
      email: 'faculty@studenttrack.edu',
      phone: '+1 (555) 234-5678',
      department: 'Computer Science',
      designation: 'Professor & HOD',
      subjects: ['Database Management Systems', 'Software Engineering & PBL Lab', 'Operating Systems'],
      cabin: 'Block B, Room 302',
    },
    {
      facultyCode: 'FAC-IT-102',
      name: 'Prof. Sarah Jenkins',
      email: 'sarah.faculty@studenttrack.edu',
      phone: '+1 (555) 345-6789',
      department: 'Information Technology',
      designation: 'Associate Professor',
      subjects: ['Design & Analysis of Algorithms', 'Cloud Computing'],
      cabin: 'Block A, Room 215',
    },
    {
      facultyCode: 'FAC-EC-103',
      name: 'Dr. Alan Walker',
      email: 'alan.walker@studenttrack.edu',
      phone: '+1 (555) 456-7890',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      subjects: ['Computer Networks', 'Distributed Systems'],
      cabin: 'Block B, Room 108',
    },
    {
      facultyCode: 'FAC-CS-104',
      name: 'Dr. Maya Patel',
      email: 'maya.patel@studenttrack.edu',
      phone: '+1 (555) 567-8901',
      department: 'Data Science',
      designation: 'Associate Professor',
      subjects: ['Artificial Intelligence', 'Data Mining'],
      cabin: 'Block C, Room 405',
    },
  ];

  await Faculty.insertMany(facultyList);

  // 2. Seed Users
  const users = [
    {
      name: 'Admin Controller',
      email: 'admin@studenttrack.edu',
      passwordHash,
      role: 'admin',
      department: 'Academic Administration',
    },
    {
      name: 'Dr. Robert Chen',
      email: 'faculty@studenttrack.edu',
      passwordHash: facultyHash,
      role: 'faculty',
      facultyCode: 'FAC-CS-101',
      department: 'Computer Science',
    },
    {
      name: 'Prof. Sarah Jenkins',
      email: 'sarah.faculty@studenttrack.edu',
      passwordHash: facultyHash,
      role: 'faculty',
      facultyCode: 'FAC-IT-102',
      department: 'Information Technology',
    },
    {
      name: 'Alex Morgan',
      email: 'student@studenttrack.edu',
      passwordHash: studentHash,
      role: 'student',
      studentRollNo: 'CS-2024-042',
      department: 'Computer Science',
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@studenttrack.edu',
      passwordHash: studentHash,
      role: 'student',
      studentRollNo: 'CS-2024-015',
      department: 'Computer Science',
    },
    {
      name: 'David Kim',
      email: 'david.kim@studenttrack.edu',
      passwordHash: studentHash,
      role: 'student',
      studentRollNo: 'CS-2024-028',
      department: 'Computer Science',
    },
  ];

  await User.insertMany(users);

  // 3. Seed Students
  const students = [
    {
      rollNo: 'CS-2024-042',
      name: 'Alex Morgan',
      email: 'student@studenttrack.edu',
      phone: '+1 (555) 019-2834',
      gender: 'Male',
      department: 'Computer Science',
      semester: 4,
      batch: '2023-2027',
      cgpa: 8.85,
      advisor: 'Dr. Robert Chen',
      address: '742 Evergreen Terrace, Springfield',
      enrollmentDate: '2023-08-15',
      status: 'Active',
    },
    {
      rollNo: 'CS-2024-015',
      name: 'Priya Patel',
      email: 'priya.patel@studenttrack.edu',
      phone: '+1 (555) 018-9921',
      gender: 'Female',
      department: 'Computer Science',
      semester: 4,
      batch: '2023-2027',
      cgpa: 9.42,
      advisor: 'Dr. Robert Chen',
      address: '120 Oakridge Lane, Metro City',
      enrollmentDate: '2023-08-15',
      status: 'Active',
    },
    {
      rollNo: 'CS-2024-028',
      name: 'David Kim',
      email: 'david.kim@studenttrack.edu',
      phone: '+1 (555) 014-5582',
      gender: 'Male',
      department: 'Computer Science',
      semester: 4,
      batch: '2023-2027',
      cgpa: 7.65,
      advisor: 'Dr. Robert Chen',
      address: '88 Riverview Court, Westwood',
      enrollmentDate: '2023-08-15',
      status: 'Active',
    },
    {
      rollNo: 'CS-2024-009',
      name: 'Emma Watson',
      email: 'emma.watson@studenttrack.edu',
      phone: '+1 (555) 013-4411',
      gender: 'Female',
      department: 'Computer Science',
      semester: 4,
      batch: '2023-2027',
      cgpa: 9.1,
      advisor: 'Dr. Alan Walker',
      address: '34 Maple Avenue, Highland',
      enrollmentDate: '2023-08-15',
      status: 'Active',
    },
    {
      rollNo: 'CS-2024-055',
      name: 'Marcus Brody',
      email: 'marcus.brody@studenttrack.edu',
      phone: '+1 (555) 017-7722',
      gender: 'Male',
      department: 'Computer Science',
      semester: 4,
      batch: '2023-2027',
      cgpa: 6.95,
      advisor: 'Dr. Robert Chen',
      address: '502 Pinecrest Blvd, Hill Valley',
      enrollmentDate: '2023-08-15',
      status: 'Active',
    },
    {
      rollNo: 'IT-2024-012',
      name: 'Sophia Rodriguez',
      email: 'sophia.r@studenttrack.edu',
      phone: '+1 (555) 016-3399',
      gender: 'Female',
      department: 'Information Technology',
      semester: 4,
      batch: '2023-2027',
      cgpa: 8.7,
      advisor: 'Prof. Sarah Jenkins',
      address: '19 Sunburst Drive, Sunnyvale',
      enrollmentDate: '2023-08-15',
      status: 'Active',
    },
    {
      rollNo: 'IT-2024-023',
      name: 'James Wilson',
      email: 'james.wilson@studenttrack.edu',
      phone: '+1 (555) 011-8844',
      gender: 'Male',
      department: 'Information Technology',
      semester: 4,
      batch: '2023-2027',
      cgpa: 8.12,
      advisor: 'Prof. Sarah Jenkins',
      address: '82 Harbor View, Newport',
      enrollmentDate: '2023-08-15',
      status: 'Active',
    },
    {
      rollNo: 'EC-2024-005',
      name: 'Aisha Al-Mansoor',
      email: 'aisha.m@studenttrack.edu',
      phone: '+1 (555) 015-1100',
      gender: 'Female',
      department: 'Electronics',
      semester: 4,
      batch: '2023-2027',
      cgpa: 8.92,
      advisor: 'Dr. Alan Walker',
      address: '407 Crescent Way, Fairview',
      enrollmentDate: '2023-08-15',
      status: 'Active',
    },
    {
      rollNo: 'CS-2023-019',
      name: 'Ethan Hunt',
      email: 'ethan.hunt@studenttrack.edu',
      phone: '+1 (555) 012-6633',
      gender: 'Male',
      department: 'Computer Science',
      semester: 6,
      batch: '2022-2026',
      cgpa: 9.35,
      advisor: 'Dr. Robert Chen',
      address: '10 Downing St, Londonderry',
      enrollmentDate: '2022-08-18',
      status: 'Active',
    },
    {
      rollNo: 'CS-2025-001',
      name: 'Chloe Bennett',
      email: 'chloe.b@studenttrack.edu',
      phone: '+1 (555) 019-9944',
      gender: 'Female',
      department: 'Computer Science',
      semester: 2,
      batch: '2024-2028',
      cgpa: 8.4,
      advisor: 'Dr. Maya Patel',
      address: '15 Magnolia Lane, Riverdale',
      enrollmentDate: '2024-08-20',
      status: 'Active',
    },
  ];

  await Student.insertMany(students);

  // 4. Seed Courses
  const courses = [
    {
      code: 'CS401',
      title: 'Database Management Systems',
      department: 'Computer Science',
      semester: 4,
      credits: 4,
      facultyName: 'Dr. Robert Chen',
      description: 'Relational algebra, SQL, normalization, transaction management, indexing and NoSQL architectures.',
    },
    {
      code: 'CS402',
      title: 'Operating Systems & Architecture',
      department: 'Computer Science',
      semester: 4,
      credits: 4,
      facultyName: 'Dr. Robert Chen',
      description: 'Concurrency, process scheduling, memory virtualization, virtual file systems, and deadlocks.',
    },
    {
      code: 'CS403',
      title: 'Design & Analysis of Algorithms',
      department: 'Computer Science',
      semester: 4,
      credits: 4,
      facultyName: 'Prof. Sarah Jenkins',
      description: 'Asymptotic complexity, dynamic programming, greedy methods, graph algorithms and NP-completeness.',
    },
    {
      code: 'CS404',
      title: 'Computer Networks',
      department: 'Computer Science',
      semester: 4,
      credits: 3,
      facultyName: 'Dr. Alan Walker',
      description: 'OSI/TCP-IP stacks, routing protocols, flow control, socket programming and transport security.',
    },
    {
      code: 'CS405',
      title: 'Full-Stack PBL Laboratory',
      department: 'Computer Science',
      semester: 4,
      credits: 2,
      facultyName: 'Dr. Robert Chen',
      description: 'Node.js, Express, MongoDB, RESTful API design, front-end dashboards, and project evaluation.',
    },
  ];

  await Course.insertMany(courses);

  // 5. Seed Attendance Records for CS 4th Sem (Past 8 sessions)
  const attendanceDates = [
    '2026-11-01',
    '2026-11-03',
    '2026-11-04',
    '2026-11-05',
    '2026-11-07',
    '2026-11-08',
    '2026-11-10',
    '2026-11-11',
  ];

  const cs4thStudents = students.filter(s => s.department === 'Computer Science' && s.semester === 4);

  const attendanceEntries = [];
  for (const date of attendanceDates) {
    // Session for CS401
    attendanceEntries.push({
      date,
      courseCode: 'CS401',
      courseName: 'Database Management Systems',
      department: 'Computer Science',
      semester: 4,
      facultyName: 'Dr. Robert Chen',
      records: cs4thStudents.map(s => {
        let status: 'Present' | 'Absent' | 'Late' = 'Present';
        if (s.rollNo === 'CS-2024-055' && (date === '2026-11-03' || date === '2026-11-07')) {
          status = 'Absent';
        } else if (s.rollNo === 'CS-2024-028' && date === '2026-11-04') {
          status = 'Late';
        } else if (s.rollNo === 'CS-2024-042' && date === '2026-11-05') {
          status = 'Present';
        }
        return {
          rollNo: s.rollNo,
          studentName: s.name,
          status,
        };
      }),
    });

    // Session for CS402
    attendanceEntries.push({
      date,
      courseCode: 'CS402',
      courseName: 'Operating Systems & Architecture',
      department: 'Computer Science',
      semester: 4,
      facultyName: 'Dr. Robert Chen',
      records: cs4thStudents.map(s => {
        let status: 'Present' | 'Absent' | 'Late' = 'Present';
        if (s.rollNo === 'CS-2024-055' && date === '2026-11-08') {
          status = 'Absent';
        }
        return {
          rollNo: s.rollNo,
          studentName: s.name,
          status,
        };
      }),
    });
  }

  await Attendance.insertMany(attendanceEntries);

  // 6. Seed Marks
  const marksData = [
    // Alex Morgan
    {
      studentRollNo: 'CS-2024-042',
      studentName: 'Alex Morgan',
      courseCode: 'CS401',
      courseName: 'Database Management Systems',
      department: 'Computer Science',
      semester: 4,
      examType: 'Mid-Term',
      marksObtained: 92,
      maxMarks: 100,
      percentage: 92,
      grade: 'A+',
      remarks: 'Excellent normalization concepts and query optimization.',
      enteredBy: 'Dr. Robert Chen',
    },
    {
      studentRollNo: 'CS-2024-042',
      studentName: 'Alex Morgan',
      courseCode: 'CS402',
      courseName: 'Operating Systems & Architecture',
      department: 'Computer Science',
      semester: 4,
      examType: 'Mid-Term',
      marksObtained: 86,
      maxMarks: 100,
      percentage: 86,
      grade: 'A',
      remarks: 'Good grasp on semaphore locking and virtual memory.',
      enteredBy: 'Dr. Robert Chen',
    },
    {
      studentRollNo: 'CS-2024-042',
      studentName: 'Alex Morgan',
      courseCode: 'CS403',
      courseName: 'Design & Analysis of Algorithms',
      department: 'Computer Science',
      semester: 4,
      examType: 'Mid-Term',
      marksObtained: 89,
      maxMarks: 100,
      percentage: 89,
      grade: 'A',
      remarks: 'Strong dynamic programming solutions.',
      enteredBy: 'Prof. Sarah Jenkins',
    },
    {
      studentRollNo: 'CS-2024-042',
      studentName: 'Alex Morgan',
      courseCode: 'CS404',
      courseName: 'Computer Networks',
      department: 'Computer Science',
      semester: 4,
      examType: 'Mid-Term',
      marksObtained: 91,
      maxMarks: 100,
      percentage: 91,
      grade: 'A+',
      remarks: 'Clean packet analysis and subnetting.',
      enteredBy: 'Dr. Alan Walker',
    },
    {
      studentRollNo: 'CS-2024-042',
      studentName: 'Alex Morgan',
      courseCode: 'CS405',
      courseName: 'Full-Stack PBL Laboratory',
      department: 'Computer Science',
      semester: 4,
      examType: 'Practical',
      marksObtained: 95,
      maxMarks: 100,
      percentage: 95,
      grade: 'A+',
      remarks: 'Outstanding Node.js Express & MongoDB PBL delivery.',
      enteredBy: 'Dr. Robert Chen',
    },

    // Priya Patel
    {
      studentRollNo: 'CS-2024-015',
      studentName: 'Priya Patel',
      courseCode: 'CS401',
      courseName: 'Database Management Systems',
      department: 'Computer Science',
      semester: 4,
      examType: 'Mid-Term',
      marksObtained: 98,
      maxMarks: 100,
      percentage: 98,
      grade: 'A+',
      remarks: 'Class highest score. Perfect index diagrams.',
      enteredBy: 'Dr. Robert Chen',
    },
    {
      studentRollNo: 'CS-2024-015',
      studentName: 'Priya Patel',
      courseCode: 'CS402',
      courseName: 'Operating Systems & Architecture',
      department: 'Computer Science',
      semester: 4,
      examType: 'Mid-Term',
      marksObtained: 94,
      maxMarks: 100,
      percentage: 94,
      grade: 'A+',
      remarks: 'Precise analysis of page replacement algorithms.',
      enteredBy: 'Dr. Robert Chen',
    },

    // David Kim
    {
      studentRollNo: 'CS-2024-028',
      studentName: 'David Kim',
      courseCode: 'CS401',
      courseName: 'Database Management Systems',
      department: 'Computer Science',
      semester: 4,
      examType: 'Mid-Term',
      marksObtained: 74,
      maxMarks: 100,
      percentage: 74,
      grade: 'B',
      remarks: 'Needs revision on B+ Tree balancing.',
      enteredBy: 'Dr. Robert Chen',
    },
    {
      studentRollNo: 'CS-2024-028',
      studentName: 'David Kim',
      courseCode: 'CS402',
      courseName: 'Operating Systems & Architecture',
      department: 'Computer Science',
      semester: 4,
      examType: 'Mid-Term',
      marksObtained: 78,
      maxMarks: 100,
      percentage: 78,
      grade: 'B+',
      remarks: 'Decent performance in memory paging.',
      enteredBy: 'Dr. Robert Chen',
    },

    // Marcus Brody
    {
      studentRollNo: 'CS-2024-055',
      studentName: 'Marcus Brody',
      courseCode: 'CS401',
      courseName: 'Database Management Systems',
      department: 'Computer Science',
      semester: 4,
      examType: 'Mid-Term',
      marksObtained: 64,
      maxMarks: 100,
      percentage: 64,
      grade: 'C',
      remarks: 'Recommended for remedial tutorial on SQL joins.',
      enteredBy: 'Dr. Robert Chen',
    },
  ];

  await Mark.insertMany(marksData);

  // 7. Seed Assignments
  const assignmentsData = [
    {
      title: 'PBL Project Milestone 1: ER Model & API Specs',
      courseCode: 'CS401',
      courseName: 'Database Management Systems',
      department: 'Computer Science',
      semester: 4,
      facultyName: 'Dr. Robert Chen',
      facultyEmail: 'faculty@studenttrack.edu',
      description: 'Submit entity-relationship diagram, 3NF schema breakdown, and Postman API contract documentation for StudentTrack.',
      dueDate: '2026-11-20',
      maxMarks: 25,
      status: 'Open',
    },
    {
      title: 'Multi-threaded Producer-Consumer Semaphore Lab',
      courseCode: 'CS402',
      courseName: 'Operating Systems & Architecture',
      department: 'Computer Science',
      semester: 4,
      facultyName: 'Dr. Robert Chen',
      facultyEmail: 'faculty@studenttrack.edu',
      description: 'Implement POSIX threads with mutex locks and conditional variables to prevent deadlock under high concurrency.',
      dueDate: '2026-11-25',
      maxMarks: 20,
      status: 'Open',
    },
    {
      title: 'Graph Traversal & Dijkstra Shortest Path Implementation',
      courseCode: 'CS403',
      courseName: 'Design & Analysis of Algorithms',
      department: 'Computer Science',
      semester: 4,
      facultyName: 'Prof. Sarah Jenkins',
      facultyEmail: 'sarah.faculty@studenttrack.edu',
      description: 'Construct adjacency list representation and benchmark Dijkstra vs Bellman-Ford on sparse graphs.',
      dueDate: '2026-11-15',
      maxMarks: 20,
      status: 'Open',
    },
    {
      title: 'SQL Stored Procedures & Trigger Security Audit',
      courseCode: 'CS401',
      courseName: 'Database Management Systems',
      department: 'Computer Science',
      semester: 4,
      facultyName: 'Dr. Robert Chen',
      facultyEmail: 'faculty@studenttrack.edu',
      description: 'Audit sample university database schemas for SQL injection vulnerability and create automated triggers for audit logs.',
      dueDate: '2026-11-05',
      maxMarks: 20,
      status: 'Closed',
    },
  ];

  const createdAssignments = await Assignment.insertMany(assignmentsData);

  // 8. Seed Submissions
  const submissionsData = [
    {
      assignmentId: createdAssignments[0]._id,
      studentRollNo: 'CS-2024-042',
      studentName: 'Alex Morgan',
      submittedAt: '2026-11-10T14:32:00Z',
      answerText: 'Attached ER diagram, schemas in 3NF and REST API endpoints collection with Bearer token authentication schema.',
      fileAttachment: 'Alex_Morgan_CS401_PBL_Milestone1.pdf',
      status: 'Submitted',
    },
    {
      assignmentId: createdAssignments[0]._id,
      studentRollNo: 'CS-2024-015',
      studentName: 'Priya Patel',
      submittedAt: '2026-11-09T18:15:00Z',
      answerText: 'Submitted full relational schema mapping with Boyce-Codd normal form decomposition proofs.',
      fileAttachment: 'Priya_Patel_CS401_Milestone1.pdf',
      status: 'Graded',
      marksAwarded: 25,
      feedback: 'Flawless BCNF analysis and crisp documentation!',
      gradedBy: 'Dr. Robert Chen',
    },
    {
      assignmentId: createdAssignments[3]._id,
      studentRollNo: 'CS-2024-042',
      studentName: 'Alex Morgan',
      submittedAt: '2026-11-04T11:20:00Z',
      answerText: 'Created PostgreSQL trigger function for logging student grade modifications into an immutable audit table.',
      fileAttachment: 'Audit_Triggers_AlexMorgan.sql',
      status: 'Graded',
      marksAwarded: 19,
      feedback: 'Very thorough trigger constraints and error bubbling.',
      gradedBy: 'Dr. Robert Chen',
    },
  ];

  await Submission.insertMany(submissionsData);

  console.log('College PBL Database seeded successfully!');
  console.log(`Summary: ${users.length} Users, ${students.length} Students, ${facultyList.length} Faculty, ${courses.length} Courses.`);
}
