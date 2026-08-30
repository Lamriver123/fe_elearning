import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { StudentAnswerResult } from '../../../student/domain/studentExam.types';
import { useSubmissionGrader } from '../../application/useSubmissionGrader';
import { useExamDetail } from '../../application/useExamDetail';

type GraderQuestionOption = {
  id: string;
  label?: string;
  content: string;
  isCorrect?: boolean;
  orderIndex?: number;
};

type GraderQuestion = {
  id: string;
  content: string;
  questionType: string;
  points: number;
  explanation?: string;
  orderIndex?: number;
  options?: GraderQuestionOption[];
};

type GraderQuestionEntry = {
  question: GraderQuestion;
  answer?: StudentAnswerResult;
  displayNumber: number;
  sectionNumber?: number;
  sectionTitle?: string;
};

function formatScore(value?: number | null) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return '0';
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/\.?0+$/, '');
}

function formatCreateMethod(method?: string) {
  if (method === 'MANUAL') return 'Thủ công';
  if (method === 'FILE_UPLOAD') return 'Đính kèm file';
  if (method === 'EXCEL_IMPORT') return 'Import Excel';
  return 'Chưa rõ';
}

function formatSkill(skill?: string) {
  if (!skill) return 'Tổng hợp';
  const labels: Record<string, string> = {
    READING: 'Đọc',
    LISTENING: 'Nghe',
    SPEAKING: 'Nói',
    WRITING: 'Viết',
    MIXED: 'Tổng hợp',
  };
  return labels[skill] ?? skill;
}

function formatQuestionType(type?: string) {
  const labels: Record<string, string> = {
    MULTIPLE_CHOICE: 'Trắc nghiệm',
    TRUE_FALSE: 'Đúng sai',
    FILL_BLANK: 'Điền từ',
    SHORT_ANSWER: 'Trả lời ngắn',
    ESSAY: 'Tự luận',
    AUDIO_RESPONSE: 'Nói',
    MATCHING: 'Ghép cặp',
    ORDERING: 'Sắp xếp',
  };
  return labels[type ?? ''] ?? 'Câu hỏi';
}

function formatOption(option?: GraderQuestionOption | StudentAnswerResult['selectedOption']) {
  if (!option) return 'Chưa có đáp án';
  return `${option.label ? `${option.label}. ` : ''}${option.content}`;
}

function getAnswerState(answer: StudentAnswerResult | undefined, maxPoints: number, score: number) {
  if (!answer) {
    return {
      label: 'Chưa trả lời',
      icon: 'help',
      pillClass: 'submission-grader__state--pending',
      cardClass: 'submission-grader__card--pending',
    };
  }

  if (answer.isAutoGraded) {
    const isCorrect = maxPoints > 0 && score >= maxPoints;
    return {
      label: isCorrect ? 'Đúng' : 'Sai',
      icon: isCorrect ? 'check_circle' : 'cancel',
      pillClass: isCorrect ? 'submission-grader__state--correct' : 'submission-grader__state--wrong',
      cardClass: isCorrect ? 'submission-grader__card--correct' : 'submission-grader__card--wrong',
    };
  }

  const isReviewed = answer.teacherComment !== undefined && answer.teacherComment !== null;

  return {
    label: isReviewed ? 'Đã chấm' : 'Cần chấm',
    icon: isReviewed ? 'task_alt' : 'rate_review',
    pillClass: isReviewed ? 'submission-grader__state--correct' : 'submission-grader__state--pending',
    cardClass: isReviewed ? 'submission-grader__card--reviewed' : 'submission-grader__card--pending',
  };
}

function SubmissionGraderSkeleton() {
  return (
    <div
      className="submission-grader submission-grader-skeleton"
      aria-label="Đang tải bài nộp"
      aria-live="polite"
    >
      <div className="teacher-page-header" aria-hidden="true">
        <div className="submission-grader-skeleton__intro">
          <span className="skeleton-chip" />
          <span className="skeleton-line skeleton-line--lg" />
        </div>
        <div className="submission-grader-skeleton__actions">
          <span className="skeleton-chip" />
          <span className="skeleton-chip" />
        </div>
      </div>

      <div className="submission-grader__answers" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <article key={item} className="submission-grader__card">
            <div className="submission-grader__question-head">
              <span className="skeleton-line skeleton-line--md" />
              <span className="skeleton-chip" />
            </div>
            <span className="skeleton-line skeleton-line--lg" />
            <span className="skeleton-line skeleton-line--md" />
            <div className="submission-grader__grading-row">
              <span className="skeleton-chip" />
              <span className="skeleton-line skeleton-line--lg" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function SubmissionGrader() {
  const { classId, examId, studentId } = useParams<{ classId: string, examId: string, studentId: string }>();
  const navigate = useNavigate();
  const { result, isLoading, isSaving, grades, currentTotal, updateScore, updateComment, saveGrades } =
    useSubmissionGrader(classId, examId, studentId);
  const { exam, isLoading: isExamLoading } = useExamDetail(classId, examId);

  const handleScoreChange = (answerId: string, newScore: number) => {
    updateScore(answerId, newScore);
  };

  const handleCommentChange = (answerId: string, comment: string) => {
    updateComment(answerId, comment);
  };

  const submissionsPath = classId && examId
    ? `/teacher/classes/${classId}/exams/${examId}?tab=submissions`
    : '/teacher/classes';

  const handleSaveGrades = async () => {
    const success = await saveGrades();
    if (success && classId && examId) {
      navigate(submissionsPath);
    }
  };

  const questionEntries = useMemo<GraderQuestionEntry[]>(() => {
    if (!result) return [];

    const answersByQuestionId = new Map(result.answers.map((answer) => [answer.question.id, answer]));

    if (exam?.sections?.length) {
      let displayNumber = 0;

      return [...exam.sections]
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .flatMap((section, sectionIndex) => (
          [...(section.questions ?? [])]
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
            .map((question) => {
              displayNumber += 1;

              return {
                question: {
                  id: question.id,
                  content: question.content,
                  questionType: question.questionType,
                  points: question.points,
                  explanation: question.explanation,
                  orderIndex: question.orderIndex,
                  options: question.options,
                },
                answer: answersByQuestionId.get(question.id),
                displayNumber,
                sectionNumber: sectionIndex + 1,
                sectionTitle: section.title,
              };
            })
        ));
    }

    return result.answers.map((answer, index) => ({
      question: answer.question,
      answer,
      displayNumber: index + 1,
    }));
  }, [exam, result]);

  const totalPossible = useMemo(
    () => questionEntries.reduce((sum, item) => sum + Number(item.question.points ?? 0), 0),
    [questionEntries],
  );

  const manualAnswers = result?.answers.filter((answer) => !answer.isAutoGraded) ?? [];
  const hasManualAnswers = manualAnswers.length > 0;
  const pendingManualCount = manualAnswers.filter((answer) => answer.teacherComment === undefined || answer.teacherComment === null).length;

  if (isLoading || isExamLoading) {
    return <SubmissionGraderSkeleton />;
  }

  if (!result) {
    return (
      <div className="submission-grader">
        <div className="page-state page-state--error">
          <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
          <p>Không tìm thấy bài nộp</p>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-grader">
      <div className="teacher-page-header submission-grader__header">
        <div className="submission-grader__intro">
          <button 
            className="teacher-btn-outline back-button" 
            type="button"
            onClick={() => navigate(submissionsPath)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Trở lại bài nộp
          </button>
          <span className="submission-grader__eyebrow">Chi tiết bài làm học sinh</span>
          <h1>{exam?.title ?? 'Chấm bài học sinh'}</h1>
          {exam?.description && <p>{exam.description}</p>}
          <div className="submission-grader__meta-list" aria-label="Thông tin đề thi">
            <span className="metric-pill">
              <span className="material-symbols-outlined" aria-hidden="true">timer</span>
              {exam?.classSettings?.durationMinutes ? `${exam.classSettings.durationMinutes} phút` : 'Không giới hạn thời gian'}
            </span>
            <span className="metric-pill">
              <span className="material-symbols-outlined" aria-hidden="true">category</span>
              {formatSkill(exam?.skillType)}
            </span>
            <span className="metric-pill">
              <span className="material-symbols-outlined" aria-hidden="true">construction</span>
              {formatCreateMethod(exam?.createMethod)}
            </span>
            <span className="metric-pill">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              {questionEntries.length} câu
            </span>
          </div>
        </div>

        <div className="submission-grader__summary">
          <div className="submission-grader__score-card" aria-label="Điểm bài làm">
            <span>Điểm hiện tại</span>
            <strong>
              {formatScore(currentTotal)}
              {totalPossible > 0 && <small>/{formatScore(totalPossible)}</small>}
            </strong>
            <em>{pendingManualCount > 0 ? `${pendingManualCount} câu cần chấm` : 'Đã xử lý câu cần chấm'}</em>
          </div>
          {hasManualAnswers && (
            <button
              className="teacher-btn-primary"
              type="button"
              onClick={handleSaveGrades}
              disabled={isSaving}
            >
              {isSaving ? 'Đang lưu...' : 'Hoàn tất chấm điểm'}
            </button>
          )}
        </div>
      </div>

      <div className="submission-grader__answers">
        {questionEntries.map(({ question, answer, displayNumber, sectionNumber, sectionTitle }) => {
          const maxPoints = Number(question.points || answer?.question.points || 0);
          const score = answer ? Number(grades[answer.id]?.score ?? answer.score ?? 0) : 0;
          const answerState = getAnswerState(answer, maxPoints, score);
          const options = [...(question.options ?? answer?.question.options ?? [])]
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
          const selectedOption = answer?.selectedOption
            ? options.find((option) => option.id === answer.selectedOption?.id) ?? answer.selectedOption
            : undefined;
          const hasOptions = options.length > 0;

          return (
            <article key={answer?.id ?? question.id} className={`submission-grader__card ${answerState.cardClass}`}>
              <div className="submission-grader__question-head">
                <div className="submission-grader__question-title-wrap">
                  {sectionTitle && (
                    <span className="submission-grader__section-label">
                      Phần {sectionNumber}: {sectionTitle}
                    </span>
                  )}
                  <h4 className="submission-grader__question-title">
                    Câu {displayNumber}: {formatQuestionType(question.questionType)}
                  </h4>
                </div>
                <div className="submission-grader__question-meta">
                  <span className="metric-pill">{formatScore(score)} / {formatScore(maxPoints)} điểm</span>
                  <span className={`submission-grader__state ${answerState.pillClass}`}>
                    <span className="material-symbols-outlined" aria-hidden="true">{answerState.icon}</span>
                    {answerState.label}
                  </span>
                </div>
              </div>

              <div className="submission-grader__prompt">
                <p>{question.content}</p>
              </div>

              {hasOptions && (
                <div className="submission-grader__choice-review">
                  

                  <div className="submission-grader-options">
                    {options.map((option) => {
                      const isCorrect = option.isCorrect === true;
                      const isSelected = option.id === selectedOption?.id;
                      const optionClass = [
                        'submission-grader-option',
                        isCorrect ? 'submission-grader-option--correct' : '',
                        isSelected ? 'submission-grader-option--selected' : '',
                        isSelected && !isCorrect ? 'submission-grader-option--wrong' : '',
                      ].filter(Boolean).join(' ');

                      return (
                        <div key={option.id} className={optionClass}>
                          <span className="submission-grader-option__mark">
                            <span className="material-symbols-outlined" aria-hidden="true">
                              {isCorrect ? 'check_circle' : isSelected ? 'cancel' : 'radio_button_unchecked'}
                            </span>
                          </span>
                          <span className="submission-grader-option__body">
                            <span className="submission-grader-option__content">
                              {formatOption(option)}
                            </span>
                            <span className="submission-grader-option__tags">
                              {isCorrect && <span className="submission-grader-option__tag submission-grader-option__tag--correct">Đáp án đúng</span>}
                              {isSelected && <span className={`submission-grader-option__tag ${isCorrect ? 'submission-grader-option__tag--selected-correct' : 'submission-grader-option__tag--selected-wrong'}`}>Học sinh chọn</span>}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!hasOptions && (
                <div className="submission-grader__free-review">
                  <div className="submission-grader__answer-panel">
                    <span>Đáp án học sinh</span>
                    {question.questionType === 'AUDIO_RESPONSE' && answer?.fileUrl ? (
                      <audio controls src={answer.fileUrl} />
                    ) : (
                      <p>{answer?.textAnswer || 'Không có câu trả lời'}</p>
                    )}
                  </div>
                </div>
              )}

              {question.explanation && (
                <div className="submission-grader__explanation">
                  <span>Đáp án / Gợi ý</span>
                  <p>{question.explanation}</p>
                </div>
              )}

              {answer?.isAutoGraded && (
                <div className="submission-grader__auto-note">
                  <span className="material-symbols-outlined" aria-hidden="true">bolt</span>
                  Câu này đã được hệ thống tự động chấm.
                </div>
              )}

              {answer && !answer.isAutoGraded && (
                <div className="submission-grader__grading-row">
                  <div className="submission-grader__score-field">
                    <label className="form-label">Chấm điểm</label>
                    <div className="submission-grader__score-control">
                      <input 
                        type="number"
                        min={0}
                        max={maxPoints}
                        value={grades[answer.id]?.score ?? 0}
                        onChange={(e) => handleScoreChange(answer.id, parseFloat(e.target.value) || 0)}
                        className="form-input submission-grader__score-input"
                      />
                      <span className="metric-pill">/ {formatScore(maxPoints)}</span>
                    </div>
                  </div>
                  
                  <div className="submission-grader__comment-field">
                    <label className="form-label">Nhận xét</label>
                    <textarea 
                      rows={2}
                      placeholder="Nhận xét của giáo viên..."
                      value={grades[answer.id]?.comment || ''}
                      onChange={(e) => handleCommentChange(answer.id, e.target.value)}
                      className="form-textarea"
                    />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
