import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { httpClient } from '../../../../shared/lib/httpClient';
import { ApiError } from '../../../../shared/lib/httpClient.js';

type ImportExcelModalProps = {
  examId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function ImportExcelModal({ examId, isOpen, onClose, onSuccess }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await httpClient.post<any>('/exams/import/excel/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreviewData(res);
      toast.success('Phân tích file thành công!');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Lỗi khi phân tích file Excel';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewData) return;
    try {
      setIsUploading(true);
      await httpClient.post('/exams/import/excel/confirm', {
        examId,
        sections: previewData.sections
      });
      toast.success('Import đề thi thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Lỗi khi lưu đề thi';
      toast.error(message);
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Import Đề Thi từ Excel</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {!previewData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-soft)', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Hướng dẫn định dạng file Excel:</p>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-muted)', fontSize: '14px' }}>
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
                <a href="#" style={{ display: 'inline-block', marginTop: '12px', color: 'var(--color-primary)', textDecoration: 'underline', fontSize: '14px' }}>Tải file mẫu (Template)</a>
              </div>
              
              <div className="form-group">
                <label className="form-label">Chọn file Excel (.xlsx)</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="form-input"
                  style={{ padding: '8px' }}
                />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Xem trước dữ liệu import</h3>
                <button className="teacher-btn-outline" onClick={handleReset} style={{ padding: '4px 12px', fontSize: '14px' }}>
                  Chọn file khác
                </button>
              </div>
              
              {previewData.sections.map((sec: any, sIdx: number) => (
                <div key={sIdx} style={{ marginBottom: '24px', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Phần {sIdx + 1}: {sec.title}</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--color-muted)' }}>Kỹ năng: {sec.skillType}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sec.questions.map((q: any, qIdx: number) => (
                      <div key={qIdx} style={{ backgroundColor: 'var(--color-surface-soft)', padding: '12px', borderRadius: '8px' }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>Câu {qIdx + 1}: {q.content}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {q.options?.map((opt: any, oIdx: number) => (
                            <div key={oIdx} style={{ 
                              padding: '8px', 
                              backgroundColor: opt.isCorrect ? 'rgba(76,175,80,0.1)' : 'var(--color-surface)',
                              border: opt.isCorrect ? '1px solid #4caf50' : '1px solid var(--color-border)',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}>
                              {opt.content} {opt.isCorrect && '✅'}
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
  );
}
