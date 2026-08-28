import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createTeacherExam } from '../../application/examUseCases';
import { ApiError } from '../../../../shared/lib/httpClient';
import type { CreateExamPayload, SkillType } from '../../domain/exam.types';

type CreateMethod = CreateExamPayload['createMethod'];

export function CreateExam() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillType, setSkillType] = useState<SkillType>('MIXED');
  const [createMethod, setCreateMethod] = useState<CreateMethod>('MANUAL');
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
      const payload: CreateExamPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        skillType,
        createMethod,
      };
      if (durationMinutes !== '') {
        payload.durationMinutes = Number(durationMinutes);
      }
      
      const newExam = await createTeacherExam(classId, payload);
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

  const skillTypes: { id: SkillType; label: string; icon: string; desc: string }[] = [
    { id: 'MIXED', label: 'Tổng hợp', icon: 'category', desc: 'Kiểm tra nhiều kỹ năng' },
    { id: 'LISTENING', label: 'Nghe', icon: 'headphones', desc: 'Bài tập audio' },
    { id: 'READING', label: 'Đọc', icon: 'menu_book', desc: 'Đọc hiểu văn bản' },
    { id: 'WRITING', label: 'Viết', icon: 'edit_document', desc: 'Viết đoạn văn / bài luận' },
    { id: 'SPEAKING', label: 'Nói', icon: 'mic', desc: 'Thu âm giọng nói' },
  ];

  const createMethods: { id: CreateMethod; label: string; icon: string; desc: string }[] = [
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
            className="teacher-btn-outline back-button" 
            onClick={() => navigate(`/teacher/classes/${classId}/exams`)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Trở lại danh sách đề thi
          </button>
          <h1>Tạo đề thi mới</h1>
          <p>Tạo một đề thi hoặc bài kiểm tra mới cho lớp học của bạn.</p>
        </div>
      </div>

      <div className="create-exam">
        <form onSubmit={handleSubmit} className="create-exam__form surface-card">
          <div className="form-group">
            <label className="form-label">Tên đề thi *</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Kiểm tra giữa kỳ môn Tiếng Anh"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả (Tùy chọn)</label>
            <textarea
              className="form-textarea"
              placeholder="Nhập mô tả ngắn gọn về đề thi này..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thời gian làm bài (Phút)</label>
            <input
              type="number"
              className="form-input"
              placeholder="Để trống nếu không giới hạn thời gian"
              value={durationMinutes}
              onChange={e => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
              disabled={isSubmitting}
              min={1}
            />
          </div>


          <div className="form-group">
            <label className="form-label">Kỹ năng kiểm tra</label>
            <div className="create-exam__skill-grid">
              {skillTypes.map(skill => {
                const isSelected = skillType === skill.id;
                return (
                  <button 
                    key={skill.id}
                    type="button"
                    onClick={() => setSkillType(skill.id)}
                    className={`create-exam__choice create-exam__choice--center ${isSelected ? 'create-exam__choice--active' : ''}`}
                    aria-pressed={isSelected}
                  >
                    <span className="material-symbols-outlined create-exam__choice-icon" aria-hidden="true">
                      {skill.icon}
                    </span>
                    <span className="create-exam__choice-label">
                      {skill.label}
                    </span>
                    <span className="create-exam__choice-desc">{skill.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hình thức tạo đề</label>
            <div className="create-exam__method-grid">
              {createMethods.map(method => {
                const isSelected = createMethod === method.id;
                return (
                  <button 
                    key={method.id}
                    type="button"
                    onClick={() => setCreateMethod(method.id)}
                    className={`create-exam__choice create-exam__choice--row ${isSelected ? 'create-exam__choice--active' : ''}`}
                    aria-pressed={isSelected}
                  >
                    <div className="create-exam__method-icon">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        {method.icon}
                      </span>
                    </div>
                    <div>
                      <div className="create-exam__choice-label">
                        {method.label}
                      </div>
                      <div className="create-exam__choice-desc">{method.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="create-exam__footer page-action-row page-action-row--end">
            <button 
              type="button" 
              className="teacher-btn-outline" 
              onClick={() => navigate(`/teacher/classes/${classId}/exams`)}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="teacher-btn-primary"
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
