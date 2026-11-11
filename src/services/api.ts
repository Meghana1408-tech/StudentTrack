import {
  User,
  UserRole,
  Student,
  Faculty,
  Course,
  Mark,
  Assignment,
  AdminDashboardData,
  FacultyDashboardData,
  StudentDashboardData,
} from '../types/index.ts';

const TOKEN_KEY = 'studenttrack_token';
const USER_KEY = 'studenttrack_user';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAuth(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  },

  // Auth APIs
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setAuth(res.token, res.user);
    return res;
  },

  async quickLogin(role: UserRole): Promise<{ token: string; user: User }> {
    const res = await this.request('/api/auth/quick-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setAuth(res.token, res.user);
    return res;
  },

  async getCurrentUser(): Promise<User> {
    const res = await this.request('/api/auth/me');
    return res.user;
  },

  async resetSeedData(): Promise<string> {
    const res = await this.request('/api/auth/seed-reset', { method: 'POST' });
    return res.message;
  },

  // Dashboard APIs
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const res = await this.request('/api/dashboard/admin');
    return res.data;
  },

  async getFacultyDashboard(): Promise<FacultyDashboardData> {
    const res = await this.request('/api/dashboard/faculty');
    return res.data;
  },

  async getStudentDashboard(): Promise<StudentDashboardData> {
    const res = await this.request('/api/dashboard/student');
    return res.data;
  },

  // Students APIs
  async getStudents(params: { search?: string; department?: string; semester?: string | number } = {}): Promise<Student[]> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.semester) query.append('semester', String(params.semester));

    const res = await this.request(`/api/students?${query.toString()}`);
    return res.data;
  },

  async getStudentProfile(idOrRoll: string): Promise<any> {
    const res = await this.request(`/api/students/${idOrRoll}`);
    return res.data;
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const res = await this.request('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
    return res.data;
  },

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    const res = await this.request(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
    return res.data;
  },

  async deleteStudent(id: string): Promise<void> {
    await this.request(`/api/students/${id}`, {
      method: 'DELETE',
    });
  },

  // Faculty APIs
  async getFacultyList(): Promise<Faculty[]> {
    const res = await this.request('/api/faculty');
    return res.data;
  },

  async getCourses(): Promise<Course[]> {
    const res = await this.request('/api/faculty/courses');
    return res.data;
  },

  // Attendance APIs
  async getAttendanceSummary(): Promise<any> {
    const res = await this.request('/api/attendance/summary');
    return res.data;
  },

  async markAttendance(payload: {
    date: string;
    courseCode: string;
    semester: number;
    department?: string;
    records: Array<{ rollNo: string; studentName: string; status: 'Present' | 'Absent' | 'Late' }>;
  }): Promise<any> {
    const res = await this.request('/api/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },

  // Marks APIs
  async getMarks(params: { courseCode?: string; examType?: string; studentRollNo?: string } = {}): Promise<Mark[]> {
    const query = new URLSearchParams();
    if (params.courseCode) query.append('courseCode', params.courseCode);
    if (params.examType) query.append('examType', params.examType);
    if (params.studentRollNo) query.append('studentRollNo', params.studentRollNo);

    const res = await this.request(`/api/marks?${query.toString()}`);
    return res.data;
  },

  async enterMark(markData: Partial<Mark>): Promise<Mark> {
    const res = await this.request('/api/marks', {
      method: 'POST',
      body: JSON.stringify(markData),
    });
    return res.data;
  },

  async bulkEnterMarks(payload: {
    courseCode: string;
    courseName?: string;
    examType: string;
    maxMarks?: number;
    entries: Array<{
      studentRollNo: string;
      studentName: string;
      marksObtained: number;
      remarks?: string;
    }>;
  }): Promise<any> {
    const res = await this.request('/api/marks/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },

  // Assignment APIs
  async getAssignments(params: { courseCode?: string; status?: string } = {}): Promise<Assignment[]> {
    const query = new URLSearchParams();
    if (params.courseCode) query.append('courseCode', params.courseCode);
    if (params.status) query.append('status', params.status);

    const res = await this.request(`/api/assignments?${query.toString()}`);
    return res.data;
  },

  async getAssignmentDetails(id: string): Promise<any> {
    const res = await this.request(`/api/assignments/${id}`);
    return res.data;
  },

  async createAssignment(assignmentData: Partial<Assignment>): Promise<Assignment> {
    const res = await this.request('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
    return res.data;
  },

  async submitAssignment(id: string, payload: { answerText: string; fileAttachment?: string }): Promise<any> {
    const res = await this.request(`/api/assignments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },

  async gradeSubmission(submissionId: string, payload: { marksAwarded: number; feedback?: string }): Promise<any> {
    const res = await this.request(`/api/assignments/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },

  // Report APIs
  async getStudentReport(rollNo: string): Promise<any> {
    const res = await this.request(`/api/reports/student/${rollNo}`);
    return res.data;
  },
};
