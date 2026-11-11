import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  facultyName: string;
  facultyEmail: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  status: 'Open' | 'Closed';
  createdAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    facultyName: { type: String, required: true },
    facultyEmail: { type: String, default: '' },
    description: { type: String, default: '' },
    dueDate: { type: String, required: true },
    maxMarks: { type: Number, default: 20 },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
