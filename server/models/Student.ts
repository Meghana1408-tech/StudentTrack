import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  department: string;
  semester: number;
  batch: string;
  cgpa: number;
  advisor: string;
  address: string;
  enrollmentDate: string;
  status: 'Active' | 'On Leave' | 'Graduated';
  avatar?: string;
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    rollNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    department: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    batch: { type: String, required: true },
    cgpa: { type: Number, default: 0.0, min: 0, max: 10 },
    advisor: { type: String, default: 'Dr. Robert Chen' },
    address: { type: String, default: '' },
    enrollmentDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, enum: ['Active', 'On Leave', 'Graduated'], default: 'Active' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
