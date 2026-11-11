export type UserRole = 'admin' | 'faculty' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentRollNo?: string;
  facultyCode?: string;
  department?: string;
  avatar?: string;
  profile?: any;
}

export interface Student {
  _id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  department: string;
  semester: number;
  batch: string;
  cgpa: number;
  advisor: string;
  address: string;
  enrollmentDate: string;
  status: 'Active' | 'On Leave' | 'Graduated';
  attendanceRate?: number;
  totalClasses?: number;
}

export interface Faculty {
  _id: string;
  facultyCode: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  subjects: string[];
  cabin: string;
}

export interface Course {
  _id: string;
  code: string;
  title: string;
  department: string;
  semester: number;
  credits: number;
  facultyName: string;
  description: string;
}

export interface AttendanceRecord {
  rollNo: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface AttendanceSession {
  _id: string;
  date: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  facultyName: string;
  records: AttendanceRecord[];
}

export interface Mark {
  _id: string;
  studentRollNo: string;
  studentName: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  examType: 'Internal 1' | 'Internal 2' | 'Mid-Term' | 'End-Term' | 'Practical';
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  remarks: string;
  enteredBy: string;
}

export interface Assignment {
  _id: string;
  title: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  facultyName: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  status: 'Open' | 'Closed';
  submissionsCount?: number;
  gradedCount?: number;
  mySubmission?: Submission | null;
  isSubmitted?: boolean;
  isGraded?: boolean;
  marksAwarded?: number;
}

export interface Submission {
  _id: string;
  assignmentId: string;
  studentRollNo: string;
  studentName: string;
  submittedAt: string;
  answerText: string;
  fileAttachment?: string;
  status: 'Submitted' | 'Graded' | 'Late';
  marksAwarded?: number;
  feedback?: string;
  gradedBy?: string;
}

export interface AdminDashboardData {
  metrics: {
    totalStudents: number;
    totalFaculty: number;
    totalCourses: number;
    totalAssignments: number;
    avgCgpa: string;
    avgAttendance: number;
  };
  departmentDistribution: {
    labels: string[];
    values: number[];
  };
  gradeDistribution: {
    labels: string[];
    values: number[];
  };
  attendanceTrend: {
    labels: string[];
    values: number[];
  };
  recentStudents: Student[];
}

export interface FacultyDashboardData {
  facultyName: string;
  courses: Course[];
  totalStudentsCount: number;
  activeAssignmentsCount: number;
  pendingGradingCount: number;
  pendingSubmissions: Submission[];
  lowAttendanceAlerts: Array<{
    rollNo: string;
    name: string;
    attended: number;
    total: number;
    rate: number;
  }>;
  students: Student[];
}

export interface StudentDashboardData {
  student: Student;
  overallAttendance: number;
  isAttendanceLow: boolean;
  totalClasses: number;
  subjectStats: Array<{
    code: string;
    title: string;
    total: number;
    attended: number;
    rate: number;
  }>;
  marks: Mark[];
  assignments: Assignment[];
}
