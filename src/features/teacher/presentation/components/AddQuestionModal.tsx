import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { addTeacherExamQuestion, updateTeacherExamQuestion } from '../../application/examUseCases';
import type { QuestionPayload, QuestionType } from '../../domain/exam.types';
import { handleApiError } from '../../../../shared/lib/handleApiError';

type AddQuestionModalProps = {
  classId: string;
  examId: string;
  sectionId: string;
  isOpen: boolean;
  initialData?: {
    id: string;
    questionType: QuestionType;
    content: string;
    points: number;
    explanation?: string;
    options?: { id: string; label?: string; content: string; isCorrect?: boolean; orderIndex: number }[];
  };
  onClose: () => void;
  onSuccess: () => void;
};

export function AddQuestionModal({ classId, examId, sectionId, isOpen, initialData, onClose, onSuccess }: AddQuestionModalProps) {
  const [questionType, setQuestionType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [content, setContent] = useState('');
  const [points, setPoints] = useState(1);
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State cho trắc nghiệm
  const [options, setOptions] = useState([
    { label: 'A', content: '', isCorrect: true },
    { label: 'B', content: '', isCorrect: false },
    { label: 'C', content: '', isCorrect: false },
    { label: 'D', content: '', isCorrect: false }
  ]);

  useEffect(() => {
    if (isOpen && initialData) {
      setQuestionType(initialData.questionType || 'MULTIPLE_CHOICE');
      setContent(initialData.content || '');
      setPoints(initialData.points || 1);
      setExplanation(initialData.explanation || '');
      
      if (initialData.options && initialData.options.length > 0) {
        // Map existing options or pad with empty ones
        const defaultLabels = ['A', 'B', 'C', 'D'];
        const mappedOptions = defaultLabels.map((label, idx) => {
          const opt = initialData.options![idx];
          if (opt) {
            return { label, content: opt.content, isCorrect: !!opt.isCorrect };
          }
          return { label, content: '', isCorrect: false };
        });
        setOptions(mappedOptions);
      } else {
        setOptions([
          { label: 'A', content: '', isCorrect: true },
          { label: 'B', content: '', isCorrect: false },
          { label: 'C', content: '', isCorrect: false },
          { label: 'D', content: '', isCorrect: false }
        ]);
      }
    } else if (isOpen) {
      setQuestionType('MULTIPLE_CHOICE');
      setContent('');
      setPoints(1);
      setExplanation('');
      setOptions([
        { label: 'A', content: '', isCorrect: true },
        { label: 'B', content: '', isCorrect: false },
        { label: 'C', content: '', isCorrect: false },
        { label: 'D', content: '', isCorrect: false }
      ]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleOptionContentChange = (index: number, newContent: string) => {
    const newOptions = [...options];
    newOptions[index].content = newContent;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    if (questionType === 'MULTIPLE_CHOICE') {
      const validOptions = options.filter(o => o.content.trim() !== '');
      if (validOptions.length < 2) {
        toast.error('Câu hỏi trắc nghiệm cần ít nhất 2 đáp án');
        return;
      }
      if (!validOptions.some(o => o.isCorrect)) {
        toast.error('Vui lòng chọn 1 đáp án đúng');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload: QuestionPayload = {
        questionType,
        content: content.trim(),
        points,
        explanation: explanation.trim(),
        orderIndex: 0,
        options: questionType === 'MULTIPLE_CHOICE'
          ? options
              .filter(o => o.content.trim() !== '')
              .map((option, index) => ({
                ...option,
                content: option.content.trim(),
                orderIndex: index,
              }))
          : [],
      };

      if (initialData) {
        await updateTeacherExamQuestion(classId, examId, sectionId, initialData.id, payload);
        toast.success('Cập nhật câu hỏi thành công');
      } else {
        await addTeacherExamQuestion(classId, examId, sectionId, payload);
        toast.success('Thêm câu hỏi thành công');
      }
      
      // Reset form
      setContent('');
      setPoints(1);
      setExplanation('');
      setOptions([
        { label: 'A', content: '', isCorrect: true },
        { label: 'B', content: '', isCorrect: false },
        { label: 'C', content: '', isCorrect: false },
        { label: 'D', content: '', isCorrect: false }
      ]);
      
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(handleApiError(err, 'Không thể thêm câu hỏi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay modal-overlay--raised" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{initialData ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-body">
          <div className="modal-form__row">
            <div className="form-group modal-form__field">
              <label className="form-label">Loại câu hỏi</label>
              <div className="custom-select-group">
                <button 
                  type="button"
                  className={`custom-select-btn custom-select-btn--compact ${questionType === 'MULTIPLE_CHOICE' ? 'active' : ''}`}
                  onClick={() => setQuestionType('MULTIPLE_CHOICE')}
                  disabled={isSubmitting}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">format_list_bulleted</span>
                  <span>Trắc nghiệm</span>
                </button>
                <button 
                  type="button"
                  className={`custom-select-btn custom-select-btn--compact ${questionType === 'ESSAY' ? 'active' : ''}`}
                  onClick={() => setQuestionType('ESSAY')}
                  disabled={isSubmitting}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">edit_note</span>
                  <span>Tự luận</span>
                </button>
                <button 
                  type="button"
                  className={`custom-select-btn custom-select-btn--compact ${questionType === 'AUDIO_RESPONSE' ? 'active' : ''}`}
                  onClick={() => setQuestionType('AUDIO_RESPONSE')}
                  disabled={isSubmitting}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">mic</span>
                  <span>Nói</span>
                </button>
              </div>
            </div>
            <div className="form-group modal-form__field modal-form__field--narrow">
              <label className="form-label">Điểm số</label>
              <input
                type="number"
                min={0}
                step={0.5}
                className="form-input"
                value={points}
                onChange={e => setPoints(parseFloat(e.target.value) || 0)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nội dung câu hỏi *</label>
            <textarea
              className="form-textarea"
              placeholder="Nhập nội dung câu hỏi..."
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {questionType === 'MULTIPLE_CHOICE' && (
            <div className="form-group">
              <label className="form-label">Các lựa chọn đáp án</label>
              <div className="question-modal__option-list">
                {options.map((opt, idx) => (
                  <div key={idx} className="question-modal__option">
                    <input 
                      type="radio" 
                      name="correct-option" 
                      checked={opt.isCorrect}
                      onChange={() => handleCorrectOptionChange(idx)}
                      className="question-modal__radio"
                    />
                    <span className="question-modal__option-label">{opt.label}.</span>
                    <input 
                      type="text"
                      className="form-input question-modal__option-input"
                      placeholder={`Nhập đáp án ${opt.label}...`}
                      value={opt.content}
                      onChange={e => handleOptionContentChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <p className="modal-hint">
                Tích chọn hình tròn (Radio) để đánh dấu đáp án đúng. Bỏ trống các ô không dùng đến nếu chỉ có 2-3 đáp án.
              </p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Giải thích đáp án (Tùy chọn)</label>
            <textarea
              className="form-textarea"
              placeholder="Học sinh sẽ thấy phần giải thích này sau khi thi..."
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="teacher-btn-outline" onClick={onClose} disabled={isSubmitting}>Hủy</button>
            <button type="submit" className="teacher-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm câu hỏi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
