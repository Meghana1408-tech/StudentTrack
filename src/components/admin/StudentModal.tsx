import React, { useState, useEffect } from 'react';
import { Student } from '../../types/index.ts';

interface StudentModalProps {
  student?: Student | null;
  onSave: (data: Partial<Student>) => Promise<void>;
  onClose: () => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ student, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    rollNo: '',
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    department: 'Computer Science',
    semester: 4,
    batch: '2023-2027',
    cgpa: 8.0,
    advisor: 'Dr. Robert Chen',
    address: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rollNo || !formData.name || !formData.email) {
      setError('Roll number, name, and email are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save student record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 p-1.5 rounded-lg text-white">
              <i className="bi bi-person-plus-fill"></i>
            </span>
            <h5 className="font-bold text-sm tracking-wide mb-0">
              {student ? `Edit Student: ${student.rollNo}` : 'Add New Student Record'}
            </h5>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-outline-light px-2 py-0.5 rounded-lg">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="alert alert-danger py-2 text-xs mb-4">
              <i className="bi bi-exclamation-circle-fill me-1"></i> {error}
            </div>
          )}

          <div className="row g-3 text-xs font-semibold text-slate-700">
            <div className="col-md-6">
              <label className="form-label">Roll Number *</label>
              <input
                type="text"
                className="form-control form-control-sm font-mono uppercase"
                placeholder="e.g. CS-2024-099"
                value={formData.rollNo}
                disabled={!!student}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="e.g. john@studenttrack.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Department *</label>
              <select
                className="form-select form-select-sm"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Semester *</label>
              <select
                className="form-select form-select-sm"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Batch</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="2023-2027"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-control form-control-sm"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Gender</label>
              <select
                className="form-select form-select-sm"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select
                className="form-select form-select-sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Faculty Advisor</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={formData.advisor}
                onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Residential Address</label>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                placeholder="Street address, city, state"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn btn-sm btn-light border px-4">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-sm btn-primary px-5">
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                  Saving...
                </>
              ) : (
                'Save Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
