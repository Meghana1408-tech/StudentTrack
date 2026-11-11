import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'faculty' | 'student';
  avatar?: string;
  studentRollNo?: string;
  facultyCode?: string;
  department?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'faculty', 'student'] },
    avatar: { type: String, default: '' },
    studentRollNo: { type: String },
    facultyCode: { type: String },
    department: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
