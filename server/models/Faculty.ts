import mongoose, { Document, Schema } from 'mongoose';

export interface IFaculty extends Document {
  facultyCode: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  subjects: string[];
  cabin: string;
  createdAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    facultyCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    subjects: [{ type: String }],
    cabin: { type: String, default: 'Room 304, Block B' },
  },
  { timestamps: true }
);

export const Faculty = mongoose.model<IFaculty>('Faculty', FacultySchema);
