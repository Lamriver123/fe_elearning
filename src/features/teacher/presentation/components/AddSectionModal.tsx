import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { addTeacherExamSection, updateTeacherExamSection } from '../../application/examUseCases';
import type { SkillType } from '../../domain/exam.types';
import { handleApiError } from '../../../../shared/lib/handleApiError';
import { ModalPortal } from './ModalPortal';

type AddSectionModalProps = {
  classId: string;
  examId: string;
  isOpen: boolean;
  initialData?: {
    id: string;
    title: string;
    instructions?: string;
    skillType?: SkillType;
  };
  onClose: () => void;
  onSuccess: () => void;
};

export function AddSectionModal({ classId, examId, isOpen, initialData, onClose, onSuccess }: AddSectionModalProps) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [skillType, setSkillType] = useState<SkillType>('READING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initialData when opening in edit mode
  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || '');
      setInstructions(initialData.instructions || '');
      setSkillType(initialData.skillType || 'READING');
    } else if (isOpen) {
      setTitle('');
      setInstructions('');
      setSkillType('READING');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên phần thi');
      return;
    }

    try {
      setIsSubmitting(true);
      if (initialData) {
        await updateTeacherExamSection(classId, examId, initialData.id, {
          title,
          instructions,
          skillType,
        });
        toast.success('Cập nhật phần thi thành công');
      } else {
        await addTeacherExamSection(classId, examId, {
          title,
          instructions,
          skillType,
          orderIndex: 0 // Backend will handle the exact order or we just pass 0 for now
        });
        toast.success('Thêm phần thi thành công');
      }
      setTitle('');
      setInstructions('');
      setSkillType('READING');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(handleApiError(err, initialData ? 'Không thể cập nhật phần thi' : 'Không thể thêm phần thi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="modal-overlay modal-overlay--portal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{initialData ? 'Sửa Phần Thi' : 'Thêm Phần Thi Mới'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
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
                <span className="material-symbols-outlined" aria-hidden="true">menu_book</span>
                <span>Đọc hiểu</span>
              </button>
              <button 
                type="button"
                className={`custom-select-btn ${skillType === 'LISTENING' ? 'active' : ''}`}
                onClick={() => setSkillType('LISTENING')}
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined" aria-hidden="true">headphones</span>
                <span>Nghe</span>
              </button>
              <button 
                type="button"
                className={`custom-select-btn ${skillType === 'SPEAKING' ? 'active' : ''}`}
                onClick={() => setSkillType('SPEAKING')}
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined" aria-hidden="true">mic</span>
                <span>Nói</span>
              </button>
              <button 
                type="button"
                className={`custom-select-btn ${skillType === 'WRITING' ? 'active' : ''}`}
                onClick={() => setSkillType('WRITING')}
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined" aria-hidden="true">edit_document</span>
                <span>Viết</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {skillType === 'READING' ? 'Đoạn văn đọc hiểu (Passage) / Hướng dẫn' : 'Hướng dẫn làm bài (Tùy chọn)'}
            </label>
            <textarea
              className="form-textarea"
              placeholder={skillType === 'READING' ? 'Nhập đoạn văn dài để học sinh đọc hiểu...' : 'Nhập hướng dẫn cho học sinh...'}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              disabled={isSubmitting}
              rows={skillType === 'READING' ? 6 : 3}
            />
            {skillType === 'LISTENING' && (
              <p className="modal-hint modal-hint--primary">
                <span className="material-symbols-outlined" aria-hidden="true">info</span>
                Sau khi tạo phần thi, hãy bấm "Đính kèm file âm thanh / tài liệu" ở màn hình chi tiết để tải file Audio (MP3) lên.
              </p>
            )}
          </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="teacher-btn-outline" onClick={onClose} disabled={isSubmitting}>Hủy</button>
            <button type="submit" className="teacher-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Lưu phần thi')}
            </button>
          </div>
        </form>
      </div>
      </div>
    </ModalPortal>
  );
}
