import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { examApi } from '../../infrastructure/examApi';
import type { Exam } from '../../domain/exam.types';

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
      const payload: any = { title, description };
      if (durationMinutes !== '') {
        payload.durationMinutes = Number(durationMinutes);
      } else {
        payload.durationMinutes = null; // To clear it if needed
      }

      await examApi.updateExam(classId, exam.id, payload);
      toast.success('Cập nhật thông tin đề thi thành công');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Không thể cập nhật thông tin đề thi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Sửa thông tin đề thi</h2>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tên đề thi *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mô tả</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', resize: 'vertical' }}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Thời gian làm bài (Phút)</label>
            <input
              type="number"
              min="1"
              value={durationMinutes}
              onChange={e => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
              placeholder="Để trống nếu không giới hạn"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              disabled={isSubmitting}
            />
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-muted)' }}>Để trống nếu bạn không muốn giới hạn thời gian.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
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
