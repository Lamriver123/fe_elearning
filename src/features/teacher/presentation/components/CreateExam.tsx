import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { examApi } from '../../infrastructure/examApi';
import { ApiError } from '../../../../shared/lib/httpClient';

export function CreateExam() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillType, setSkillType] = useState('MIXED');
  const [createMethod, setCreateMethod] = useState('MANUAL');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên đề thi');
      return;
    }

    if (!classId) return;

    try {
      setIsSubmitting(true);
      const payload: any = { title, description, skillType, createMethod };
      if (durationMinutes !== '') {
        payload.durationMinutes = Number(durationMinutes);
      }
      
      const newExam = await examApi.createExam(classId, payload);
      toast.success('Tạo đề thi thành công');
      
      // Chuyển hướng đến trang chi tiết đề thi vừa tạo
      navigate(`/teacher/classes/${classId}/exams/${newExam.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tạo đề thi';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillTypes = [
    { id: 'MIXED', label: 'Tổng hợp', icon: 'category', desc: 'Kiểm tra nhiều kỹ năng' },
    { id: 'LISTENING', label: 'Nghe', icon: 'headphones', desc: 'Bài tập audio' },
    { id: 'READING', label: 'Đọc', icon: 'menu_book', desc: 'Đọc hiểu văn bản' },
    { id: 'WRITING', label: 'Viết', icon: 'edit_document', desc: 'Viết đoạn văn / bài luận' },
    { id: 'SPEAKING', label: 'Nói', icon: 'mic', desc: 'Thu âm giọng nói' },
  ];

  const createMethods = [
    { id: 'MANUAL', label: 'Tạo thủ công', icon: 'edit_square', desc: 'Thêm từng câu hỏi' },
    { id: 'FILE_UPLOAD', label: 'Upload File', icon: 'upload_file', desc: 'Dùng file PDF / Word' },
    { id: 'EXCEL_IMPORT', label: 'Import Excel', icon: 'table', desc: 'Nhập hàng loạt câu hỏi' },
  ];

  return (
    <div className="teacher-content-container">
      <div className="teacher-page-header">
        <div>
          <button 
            type="button"
            className="teacher-btn-outline" 
            style={{ marginBottom: '16px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => navigate(`/teacher/classes/${classId}/exams`)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Trở lại danh sách đề thi
          </button>
          <h1 style={{ margin: 0 }}>Tạo Đề Thi Mới</h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--color-muted)' }}>Tạo một đề thi hoặc bài kiểm tra mới cho lớp học của bạn.</p>
        </div>
      </div>

      <div style={{ marginTop: '32px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--color-surface)', padding: '32px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tên đề thi *</label>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              placeholder="VD: Kiểm tra giữa kỳ môn Tiếng Anh"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mô tả (Tùy chọn)</label>
            <textarea
              className="form-textarea"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', resize: 'vertical' }}
              placeholder="Nhập mô tả ngắn gọn về đề thi này..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Thời gian làm bài (Phút)</label>
            <input
              type="number"
              className="form-input"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              placeholder="Để trống nếu không giới hạn thời gian"
              value={durationMinutes}
              onChange={e => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
              disabled={isSubmitting}
              min={1}
            />
          </div>


          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>Kỹ năng kiểm tra</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              {skillTypes.map(skill => {
                const isSelected = skillType === skill.id;
                return (
                  <div 
                    key={skill.id}
                    onClick={() => setSkillType(skill.id)}
                    style={{
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.05)' : 'var(--color-surface)',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '28px', color: isSelected ? 'var(--color-primary)' : 'var(--color-muted)' }}>
                      {skill.icon}
                    </span>
                    <span style={{ fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                      {skill.label}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{skill.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '40px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>Hình thức tạo đề</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {createMethods.map(method => {
                const isSelected = createMethod === method.id;
                return (
                  <div 
                    key={method.id}
                    onClick={() => setCreateMethod(method.id)}
                    style={{
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.05)' : 'var(--color-surface)',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ 
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface-soft)', 
                      width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <span className="material-symbols-outlined" style={{ color: isSelected ? '#fff' : 'var(--color-muted)' }}>
                        {method.icon}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text)', marginBottom: '4px' }}>
                        {method.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{method.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
            <button 
              type="button" 
              className="teacher-btn-outline" 
              style={{ padding: '12px 24px', fontWeight: 600 }}
              onClick={() => navigate(`/teacher/classes/${classId}/exams`)}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="teacher-btn-primary"
              style={{ padding: '12px 32px', fontWeight: 600 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tiếp tục tạo đề thi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
