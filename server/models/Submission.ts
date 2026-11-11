import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
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

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentRollNo: { type: String, required: true },
    studentName: { type: String, required: true },
    submittedAt: { type: String, default: () => new Date().toISOString() },
    answerText: { type: String, default: '' },
    fileAttachment: { type: String, default: '' },
    status: { type: String, enum: ['Submitted', 'Graded', 'Late'], default: 'Submitted' },
    marksAwarded: { type: Number },
    feedback: { type: String, default: '' },
    gradedBy: { type: String },
  },
  { timestamps: true }
);

SubmissionSchema.index({ assignmentId: 1, studentRollNo: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
