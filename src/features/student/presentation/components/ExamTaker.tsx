import { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  autoSaveStudentExam,
  startStudentExam,
  submitStudentExam,
  uploadStudentExamAudio,
  useStudentExamDetail,
} from '../../application/useStudentExams';
import { QuestionRenderer } from './QuestionRenderer';
import type { StudentAnswerPayload } from '../../domain/studentExam.types';
import { handleApiError } from '../../../../shared/lib/handleApiError';

type AnswerValue = string | Blob | null;
type AnswersState = Record<string, AnswerValue>;

function ExamTakerSkeleton() {
  return (
    <div
      className="exam-taker-container exam-taker-skeleton"
      aria-label="Đang tải đề thi"
      aria-live="polite"
    >
      <div className="exam-taker-header" aria-hidden="true">
        <div className="exam-taker-skeleton__intro">
          <span className="skeleton-line skeleton-line--lg" />
          <span className="skeleton-line skeleton-line--sm" />
        </div>
        <div className="exam-taker-header__actions">
          <span className="skeleton-chip" />
          <span className="skeleton-chip" />
        </div>
      </div>

      <div className="exam-taker-main" aria-hidden="true">
        <div className="exam-taker-main__inner">
          {[1, 2].map((section) => (
            <section key={section} className="exam-taker-section">
              <div className="exam-taker-section__header">
                <span className="skeleton-line skeleton-line--lg" />
                <span className="skeleton-chip" />
                <div className="exam-taker-instructions">
                  <span className="skeleton-line skeleton-line--md" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line skeleton-line--lg" />
                </div>
              </div>
              <div className="question-card">
                <div className="question-card__head">
                  <span className="skeleton-line skeleton-line--md" />
                  <span className="skeleton-chip" />
                </div>
                <span className="skeleton-line skeleton-line--lg" />
                <span className="skeleton-line skeleton-line--md" />
                <div className="question-card__options">
                  <span className="skeleton-line" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line" />
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ExamTaker({ classId }: { classId: string }) {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { exam, isLoading, error } = useStudentExamDetail(classId, examId!);
  
  const [answers, setAnswers] = useState<AnswersState>({});
  const [timeLeft, setTimeLeft] = useState<number>(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<number | ReturnType<typeof setInterval> | null>(null);
  
  // Use ref to hold latest answers for auto-submit inside setInterval closure
  const answersRef = useRef<AnswersState>({});

  // Initialize time and restore cached answers
  useEffect(() => {
    if (exam && !isLoading && classId && examId) {
      startStudentExam(classId, examId).then((res) => {
        if (res.isSubmitted) {
          toast.error("Bài thi này đã được nộp!");
          navigate(`/student/courses/${classId}/exams`);
          return;
        }

        const storageKeyAnswers = `exam_answers_${classId}_${examId}`;
        const cachedAnswersStr = localStorage.getItem(storageKeyAnswers);
        let mergedAnswers = { ...(res.autoSavedAnswers || {}) };
        
        if (cachedAnswersStr) {
          try {
            mergedAnswers = { ...mergedAnswers, ...JSON.parse(cachedAnswersStr) };
          } catch {
            // Ignore malformed cached answers from older sessions.
          }
        }
        setAnswers(mergedAnswers);
        answersRef.current = mergedAnswers;

        if (exam.classSettings?.durationMinutes) {
          const startTimestamp = new Date(res.startTime).getTime();
          const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
          const remaining = (exam.classSettings.durationMinutes * 60) - elapsed;
          if (remaining <= 0) {
             setTimeLeft(0);
          } else {
             setTimeLeft(remaining);
          }
        }
      }).catch(err => {
        toast.error(handleApiError(err, 'Không thể bắt đầu bài thi. Vui lòng thử lại.'));
      });
    }
  }, [exam, isLoading, classId, examId, navigate]);

  const handleAnswerChange = (questionId: string, value: AnswerValue) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: value };
      answersRef.current = newAnswers;
      
      // Save string answers to localStorage & Backend
      const stringAnswers: Record<string, string> = {};
      Object.entries(newAnswers).forEach(([k, v]) => {
        if (typeof v === 'string') stringAnswers[k] = v;
      });
      localStorage.setItem(`exam_answers_${classId}_${examId}`, JSON.stringify(stringAnswers));
      
      if (classId && examId) {
        autoSaveStudentExam(classId, examId, stringAnswers).catch(() => {});
      }
      
      return newAnswers;
    });
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent, isAutoSubmit = false) => {
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
          const val = answersRef.current[q.id];
          if (val === undefined || val === null) continue;

          if (q.questionType === 'MULTIPLE_CHOICE') {
            formattedAnswers.push({ questionId: q.id, selectedOptionId: val as string });
          } else if (q.questionType === 'ESSAY') {
            formattedAnswers.push({ questionId: q.id, textAnswer: val as string });
          } else if (q.questionType === 'AUDIO_RESPONSE') {
            // Upload audio blob first
            toast.loading(`Đang tải lên audio câu hỏi ${q.orderIndex}...`, { id: toastId });
            const audioUrl = await uploadStudentExamAudio(classId, examId, val as Blob);
            formattedAnswers.push({ questionId: q.id, audioUrl: audioUrl });
          }
        }
      }

      toast.loading('Đang nộp bài...', { id: toastId });
      const res = await submitStudentExam(classId, examId, { answers: formattedAnswers });
      
      // Clear localStorage after successful submit
      localStorage.removeItem(`exam_answers_${classId}_${examId}`);
      localStorage.removeItem(`exam_startTime_${classId}_${examId}`);
      
      toast.success(res.message, { id: toastId });
      
      // Chuyển về danh sách exam hoặc trang kết quả
      navigate(`/student/courses/${classId}/exams`);
    } catch (err) {
      toast.error(handleApiError(err, 'Lỗi khi nộp bài. Vui lòng thử lại.'));
      setIsSubmitting(false);
      // Resume timer if not auto submit
      if (!isAutoSubmit && timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
      }
    }
  }, [classId, exam, examId, navigate, timeLeft]);

  const handleAutoSubmit = useCallback(() => {
    toast('Hết giờ làm bài! Hệ thống đang tự động nộp bài...', { id: 'auto-submit' });
    void handleSubmit(undefined, true);
  }, [handleSubmit]);

  // Timer logic
  useEffect(() => {
    if (exam?.classSettings?.durationMinutes && !isSubmitting) {
      if (timeLeft === 0) {
        handleAutoSubmit();
      } else if (timeLeft > 0) {
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
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam, timeLeft, isSubmitting, handleAutoSubmit]);

  const formatTimeLeft = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading) {
    return <ExamTakerSkeleton />;
  }

  if (error || !exam) {
    return (
      <div className="page-state page-state--error">
        <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  const isWarningTime = timeLeft <= 300; // <= 5 minutes

  return (
    <div className="exam-taker-container">
      <div className="exam-taker-header">
        <div>
          <h2 className="exam-taker-header__title">{exam.title}</h2>
          <p className="exam-taker-header__subtitle">Tổng điểm: {exam.totalPoints}</p>
        </div>
        <div className="exam-taker-header__actions">
          {exam?.classSettings?.durationMinutes && (
            <div className={`exam-taker-timer ${isWarningTime ? 'exam-taker-timer--warning' : ''}`}>
              <span className="material-symbols-outlined" aria-hidden="true">timer</span>
              {formatTimeLeft()}
            </div>
          )}
          <button 
            className="teacher-btn-primary"
            type="button"
            onClick={() => void handleSubmit(undefined, false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>

      <div className="exam-taker-main">
        <div className="exam-taker-main__inner">
          {exam.sections.map((section, sIdx) => (
            <div key={section.id} className="exam-taker-section">
              <div className="exam-taker-section__header">
                <h3 className="exam-taker-section__title">Phần {sIdx + 1}: {section.title}</h3>
                <div className="exam-taker-section__meta">
                  <span className="metric-pill">
                    Kỹ năng: {section.skillType}
                  </span>
                </div>
                {section.files && section.files.length > 0 && (
                  <div className="exam-taker-section__files">
                    {section.files.map((f) => (
                      <div key={f.id}>
                        {f.fileType === 'AUDIO' && (
                          <div className="exam-taker-file exam-taker-file--audio">
                            <div className="exam-taker-file__head">
                              <span className="material-symbols-outlined" aria-hidden="true">headphones</span>
                              <span>Audio bài nghe</span>
                            </div>
                            <audio controls src={f.fileUrl} />
                          </div>
                        )}
                        {f.fileType !== 'AUDIO' && (
                          <div className="exam-taker-file">
                            <span className="material-symbols-outlined" aria-hidden="true">attach_file</span>
                            <a href={f.fileUrl} target="_blank" rel="noopener noreferrer">
                              Tài liệu đính kèm
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {section.instructions && (
                  <div className="exam-taker-instructions">
                    <span className="exam-taker-instructions__label">
                      {section.skillType === 'READING' ? 'Nội dung bài đọc:' : 'Hướng dẫn làm bài:'}
                    </span>
                    <div className="exam-taker-instructions__content">{section.instructions}</div>
                  </div>
                )}
              </div>

              <div>
                {section.questions.map((q, qIdx) => (
                  <QuestionRenderer 
                    key={q.id}
                    question={q}
                    index={qIdx + 1}
                    value={answers[q.id] ?? null}
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
