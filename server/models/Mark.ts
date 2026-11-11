import mongoose, { Document, Schema } from 'mongoose';

export interface IMark extends Document {
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

const MarkSchema = new Schema<IMark>(
  {
    studentRollNo: { type: String, required: true, uppercase: true },
    studentName: { type: String, required: true },
    courseCode: { type: String, required: true, uppercase: true },
    courseName: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    examType: {
      type: String,
      required: true,
      enum: ['Internal 1', 'Internal 2', 'Mid-Term', 'End-Term', 'Practical'],
    },
    marksObtained: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, default: 100 },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true },
    remarks: { type: String, default: '' },
    enteredBy: { type: String, default: 'Faculty' },
  },
  { timestamps: true }
);

MarkSchema.index({ studentRollNo: 1, courseCode: 1, examType: 1 }, { unique: true });

export const Mark = mongoose.model<IMark>('Mark', MarkSchema);
