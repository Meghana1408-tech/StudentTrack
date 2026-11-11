import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  code: string;
  title: string;
  department: string;
  semester: number;
  credits: number;
  facultyName: string;
  description: string;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    credits: { type: Number, required: true, default: 3 },
    facultyName: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
