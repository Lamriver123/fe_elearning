import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { uploadTeacherExamFile } from '../../application/examUseCases';
import { handleApiError } from '../../../../shared/lib/handleApiError';
import { ModalPortal } from './ModalPortal';

type UploadExamFileModalProps = {
  classId: string;
  examId: string;
  sectionId?: string; // Tùy chọn, nếu muốn đính file vào 1 phần cụ thể
  questionId?: string; // Tùy chọn, nếu muốn đính file vào 1 câu hỏi
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function UploadExamFileModal({ classId, examId, sectionId, questionId, isOpen, onClose, onSuccess }: UploadExamFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [purpose, setPurpose] = useState('EXAM_ORIGINAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Vui lòng chọn file');
      return;
    }

    try {
      setIsSubmitting(true);
      await uploadTeacherExamFile(classId, examId, file, purpose, sectionId, questionId);
      toast.success('Upload file thành công');
      setFile(null);
      setPurpose('EXAM_ORIGINAL');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(handleApiError(err, 'Không thể upload file'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="modal-overlay modal-overlay--raised modal-overlay--portal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{sectionId ? 'Đính kèm File vào Phần Thi' : 'Đính kèm File Đề Thi'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Tệp tin *</label>
            <div className="file-picker">
              <input
                type="file"
                ref={fileInputRef}
                className="file-picker__input"
                onChange={e => setFile(e.target.files?.[0] || null)}
                disabled={isSubmitting}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.mp3,.mp4,.png,.jpg,.jpeg"
              />
              <button 
                type="button"
                className="teacher-btn-outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                Chọn File
              </button>
              <span className={`file-picker__name ${file ? 'file-picker__name--selected' : ''}`}>
                {file ? file.name : 'Chưa chọn file nào'}
              </span>
            </div>
            <p className="modal-hint">
              Hỗ trợ PDF, Word, Excel, Hình ảnh và Audio (MP3)
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Mục đích sử dụng</label>
            <select 
              className="form-input" 
              value={purpose} 
              onChange={e => setPurpose(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="EXAM_ORIGINAL">Tài liệu tham khảo (Đề bài/PDF)</option>
              <option value="LISTENING_AUDIO">File Audio (Bài nghe)</option>
              <option value="ANSWER_KEY">File Đáp án</option>
            </select>
          </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="teacher-btn-outline" onClick={onClose} disabled={isSubmitting}>Hủy</button>
            <button type="submit" className="teacher-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tải lên...' : 'Tải lên'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </ModalPortal>
  );
}
