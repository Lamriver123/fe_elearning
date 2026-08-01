import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { examApi } from '../../infrastructure/examApi';

type AddSectionModalProps = {
  classId: string;
  examId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddSectionModal({ classId, examId, isOpen, onClose, onSuccess }: AddSectionModalProps) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [skillType, setSkillType] = useState('READING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên phần thi');
      return;
    }

    try {
      setIsSubmitting(true);
      await examApi.addSection(classId, examId, {
        title,
        instructions,
        skillType,
        orderIndex: 0 // Backend will handle the exact order or we just pass 0 for now
      });
      toast.success('Thêm phần thi thành công');
      setTitle('');
      setInstructions('');
      setSkillType('READING');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Không thể thêm phần thi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Thêm Phần Thi Mới</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Tên phần thi *</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Phần 1 - Đọc hiểu"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kỹ năng</label>
            <div className="custom-select-group">
              <button 
                type="button"
                className={`custom-select-btn ${skillType === 'READING' ? 'active' : ''}`}
                onClick={() => setSkillType('READING')}
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined">menu_book</span>
                <span>Đọc hiểu</span>
              </button>
              <button 
                type="button"
                className={`custom-select-btn ${skillType === 'LISTENING' ? 'active' : ''}`}
                onClick={() => setSkillType('LISTENING')}
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined">headphones</span>
                <span>Nghe</span>
              </button>
              <button 
                type="button"
                className={`custom-select-btn ${skillType === 'SPEAKING' ? 'active' : ''}`}
                onClick={() => setSkillType('SPEAKING')}
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined">mic</span>
                <span>Nói</span>
              </button>
              <button 
                type="button"
                className={`custom-select-btn ${skillType === 'WRITING' ? 'active' : ''}`}
                onClick={() => setSkillType('WRITING')}
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined">edit_document</span>
                <span>Viết</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hướng dẫn làm bài (Tùy chọn)</label>
            <textarea
              className="form-textarea"
              placeholder="Nhập hướng dẫn cho học sinh..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="teacher-btn-outline" onClick={onClose} disabled={isSubmitting}>Hủy</button>
            <button type="submit" className="teacher-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu phần thi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
