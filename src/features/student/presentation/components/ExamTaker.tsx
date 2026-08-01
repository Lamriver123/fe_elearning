import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useStudentExamDetail } from '../../application/useStudentExams';
import { studentExamApi } from '../../infrastructure/studentExamApi';
import { QuestionRenderer } from './QuestionRenderer';
import type { StudentAnswerPayload } from '../../domain/studentExam.types';

type AnswersState = {
  [questionId: string]: any; // optionId, text, or Blob (for audio)
};

export function ExamTaker({ classId }: { classId: string }) {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { exam, isLoading, error } = useStudentExamDetail(classId, examId!);
  
  const [answers, setAnswers] = useState<AnswersState>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<number | ReturnType<typeof setInterval> | null>(null);

  // Initialize time
  useEffect(() => {
    if (exam && timeLeft === 0 && exam.classSettings?.durationMinutes) {
      setTimeLeft(exam.classSettings.durationMinutes * 60);
    }
  }, [exam]);

  // Timer logic
  useEffect(() => {
    if (exam?.classSettings?.durationMinutes && timeLeft > 0 && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam, timeLeft, isSubmitting]);

  const handleAutoSubmit = () => {
    toast('Hết giờ làm bài! Hệ thống đang tự động nộp bài...', { icon: '⏳' });
    handleSubmit(new Event('submit') as any, true);
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, isAutoSubmit = false) => {
    e?.preventDefault();
    if (!exam || !classId || !examId) return;

    if (!isAutoSubmit) {
      const confirm = window.confirm('Bạn có chắc chắn muốn nộp bài?');
      if (!confirm) return;
    }

    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const toastId = toast.loading('Đang xử lý bài làm của bạn...');
      
      const formattedAnswers: StudentAnswerPayload['answers'] = [];

      for (const section of exam.sections) {
        for (const q of section.questions) {
          const val = answers[q.id];
          if (val === undefined || val === null) continue;

          if (q.questionType === 'MULTIPLE_CHOICE') {
            formattedAnswers.push({ questionId: q.id, selectedOptionId: val as string });
          } else if (q.questionType === 'ESSAY') {
            formattedAnswers.push({ questionId: q.id, textAnswer: val as string });
          } else if (q.questionType === 'SPEAKING') {
            // Upload audio blob first
            toast.loading(`Đang tải lên audio câu hỏi ${q.orderIndex}...`, { id: toastId });
            const audioUrl = await studentExamApi.uploadAudio(classId, examId, val as Blob);
            formattedAnswers.push({ questionId: q.id, audioUrl: audioUrl });
          }
        }
      }

      toast.loading('Đang nộp bài...', { id: toastId });
      const res = await studentExamApi.submitExam(classId, examId, { answers: formattedAnswers });
      
      toast.success(res.message, { id: toastId });
      
      // Chuyển về danh sách exam hoặc trang kết quả
      navigate(`/student/courses/${classId}/exams`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi nộp bài. Vui lòng thử lại.');
      setIsSubmitting(false);
      // Resume timer if not auto submit
      if (!isAutoSubmit && timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
      }
    }
  };

  const formatTimeLeft = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải đề thi...</div>;
  if (error || !exam) return <div style={{ padding: '40px', textAlign: 'center' }}>Lỗi: {error}</div>;

  const isWarningTime = timeLeft <= 300; // <= 5 minutes

  return (
    <div className="exam-taker-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Sticky */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>{exam.title}</h2>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '14px' }}>Tổng điểm: {exam.totalPoints}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {exam?.classSettings?.durationMinutes && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '24px',
              backgroundColor: isWarningTime ? 'rgba(244, 67, 54, 0.1)' : 'var(--color-surface-soft)',
              color: isWarningTime ? '#f44336' : 'var(--color-text)',
              fontWeight: 700,
              fontSize: '18px'
            }}>
              <span className="material-symbols-outlined" style={{ animation: isWarningTime ? 'pulse 1s infinite' : 'none' }}>
                timer
              </span>
              {formatTimeLeft()}
            </div>
          )}
          <button 
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: 'var(--color-background)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {exam.sections.map((section, sIdx) => (
            <div key={section.id} style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid var(--color-border)' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Phần {sIdx + 1}: {section.title}</h3>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ padding: '4px 8px', backgroundColor: 'var(--color-surface-soft)', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                    Kỹ năng: {section.skillType}
                  </span>
                </div>
                {section.instructions && (
                  <div style={{ padding: '12px', backgroundColor: 'rgba(33, 150, 243, 0.05)', borderLeft: '4px solid #2196f3', borderRadius: '4px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text)' }}>{section.instructions}</p>
                  </div>
                )}
              </div>

              <div>
                {section.questions.map((q, qIdx) => (
                  <QuestionRenderer 
                    key={q.id}
                    question={q}
                    index={qIdx + 1}
                    value={answers[q.id]}
                    onChange={(val) => handleAnswerChange(q.id, val)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
