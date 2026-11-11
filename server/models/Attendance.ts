import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceRecord {
  studentId?: string;
  rollNo: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface IAttendance extends Document {
  date: string; // YYYY-MM-DD
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  facultyName: string;
  records: IAttendanceRecord[];
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    date: { type: String, required: true },
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    facultyName: { type: String, required: true },
    records: [
      {
        studentId: { type: String },
        rollNo: { type: String, required: true },
        studentName: { type: String, required: true },
        status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
      },
    ],
  },
  { timestamps: true }
);

AttendanceSchema.index({ date: 1, courseCode: 1, semester: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
