import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { confirmTeacherExamExcelImport, previewTeacherExamExcelImport } from '../../application/examUseCases';
import type { ExcelImportPreview } from '../../domain/exam.types';
import { handleApiError } from '../../../../shared/lib/handleApiError';
import { ModalPortal } from './ModalPortal';

type ImportExcelModalProps = {
  examId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function ImportExcelModal({ examId, isOpen, onClose, onSuccess }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelImportPreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file Excel');
      return;
    }

    try {
      setIsUploading(true);
      const res = await previewTeacherExamExcelImport(file);
      setPreviewData(res);
      toast.success('Phân tích file thành công!');
    } catch (err) {
      toast.error(handleApiError(err, 'Lỗi khi phân tích file Excel'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewData) return;
    try {
      setIsUploading(true);
      await confirmTeacherExamExcelImport(examId, previewData.sections);
      toast.success('Import đề thi thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(handleApiError(err, 'Lỗi khi lưu đề thi'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="modal-overlay modal-overlay--portal" onClick={onClose}>
      <div className="modal-content modal-content--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Import Đề Thi từ Excel</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        
        <div className="modal-body modal-body--scroll">
          {!previewData ? (
            <div className="import-modal__setup">
              <div className="import-modal__guide">
                <p className="import-modal__guide-title">Hướng dẫn định dạng file Excel:</p>
                <ul className="import-modal__guide-list">
                  <li>Dòng 1: Tiêu đề cột (Bỏ qua khi đọc)</li>
                  <li>Cột A (1): Tên phần thi (Section Title)</li>
                  <li>Cột B (2): Hướng dẫn phần thi (Instructions)</li>
                  <li>Cột C (3): Loại kỹ năng (READING, LISTENING, SPEAKING, WRITING)</li>
                  <li>Cột D (4): Nội dung câu hỏi (Question Content)</li>
                  <li>Cột E (5) -&gt; H (8): Đáp án A, B, C, D</li>
                  <li>Cột I (9): Đáp án đúng (A/B/C/D)</li>
                  <li>Cột J (10): Loại câu hỏi (MULTIPLE_CHOICE, ESSAY...)</li>
                  <li>Cột K (11): Điểm (Points)</li>
                </ul>
                <a href="#" className="import-modal__template-link">Tải file mẫu (Template)</a>
              </div>
              
              <div className="form-group">
                <label className="form-label">Chọn file Excel (.xlsx)</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="form-input import-modal__file-input"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="import-modal__preview-head">
                <h3 className="import-modal__preview-title">Xem trước dữ liệu import</h3>
                <button className="teacher-btn-outline import-modal__reset" onClick={handleReset}>
                  Chọn file khác
                </button>
              </div>
              
              {previewData.sections.map((sec, sIdx) => (
                <div key={`${sec.title}-${sIdx}`} className="import-modal__section">
                  <h4 className="import-modal__section-title">Phần {sIdx + 1}: {sec.title}</h4>
                  <p className="import-modal__section-meta">Kỹ năng: {sec.skillType}</p>
                  
                  <div className="import-modal__question-list">
                    {sec.questions.map((q, qIdx) => (
                      <div key={`${q.content}-${qIdx}`} className="import-modal__question">
                        <p className="import-modal__question-title">Câu {qIdx + 1}: {q.content}</p>
                        <div className="import-modal__option-grid">
                          {q.options?.map((opt, oIdx) => (
                            <div
                              key={`${opt.content}-${oIdx}`}
                              className={`import-modal__option ${opt.isCorrect ? 'import-modal__option--correct' : ''}`}
                            >
                              <span>{opt.content}</span>
                              {opt.isCorrect && (
                                <span className="material-symbols-outlined import-modal__option-check" aria-hidden="true">check_circle</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="teacher-btn-outline" onClick={onClose} disabled={isUploading}>
            Hủy
          </button>
          
          {!previewData ? (
            <button type="button" className="teacher-btn-primary" onClick={handlePreview} disabled={!file || isUploading}>
              {isUploading ? 'Đang đọc file...' : 'Phân tích file'}
            </button>
          ) : (
            <button type="button" className="teacher-btn-primary" onClick={handleConfirm} disabled={isUploading}>
              {isUploading ? 'Đang lưu...' : 'Xác nhận Import'}
            </button>
          )}
        </div>
      </div>
      </div>
    </ModalPortal>
  );
}
