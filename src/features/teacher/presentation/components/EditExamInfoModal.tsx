import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { updateTeacherExam } from '../../application/examUseCases';
import type { Exam, UpdateExamPayload } from '../../domain/exam.types';
import { handleApiError } from '../../../../shared/lib/handleApiError';

type EditExamInfoModalProps = {
  classId: string;
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditExamInfoModal({ classId, exam, isOpen, onClose, onSuccess }: EditExamInfoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(exam.title || '');
      setDescription(exam.description || '');
      setDurationMinutes(exam.classSettings?.durationMinutes || '');
    }
  }, [isOpen, exam]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên đề thi');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: UpdateExamPayload = { title: title.trim(), description: description.trim() };
      if (durationMinutes !== '') {
        payload.durationMinutes = Number(durationMinutes);
      } else {
        payload.durationMinutes = null;
      }

      await updateTeacherExam(classId, exam.id, payload);
      toast.success('Cập nhật thông tin đề thi thành công');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(handleApiError(err, 'Không thể cập nhật thông tin đề thi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--compact" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Sửa thông tin đề thi</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-body modal-form__body">
          <div className="form-group">
            <label className="form-label">Tên đề thi *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thời gian làm bài (phút)</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={durationMinutes}
              onChange={e => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
              placeholder="Để trống nếu không giới hạn"
              disabled={isSubmitting}
            />
            <p className="modal-hint">Để trống nếu bạn không muốn giới hạn thời gian.</p>
          </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="teacher-btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="teacher-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
