import { useNavigate } from 'react-router-dom';
import { useExamSubmissions } from '../../application/useExamSubmissions';
import type { ExamSubmissionSummary } from '../../domain/exam.types';

type ExamSubmissionsProps = {
  classId: string;
  examId: string;
  isPublished: boolean;
};

function toNumber(value?: number | string | null) {
  return Number(value ?? 0);
}

function getSubmissionState(submission: ExamSubmissionSummary) {
  const pendingManualCount = toNumber(submission.pendingManualCount);
  const manualAnswerCount = toNumber(submission.manualAnswerCount);
  const hasGradingMeta = submission.pendingManualCount !== undefined || submission.manualAnswerCount !== undefined;
  const status = submission.status?.toUpperCase();
  const isGraded = status === 'GRADED' || (hasGradingMeta && pendingManualCount === 0);

  if (isGraded) {
    return {
      isGraded,
      className: 'exam-submission-card--graded',
      label: manualAnswerCount > 0 ? 'Đã chấm' : 'Tự động chấm',
      icon: 'task_alt',
      actionLabel: 'Xem chi tiết',
    };
  }

  return {
    isGraded,
    className: 'exam-submission-card--pending',
    label: pendingManualCount > 0 ? `Chưa chấm ${pendingManualCount}` : 'Chưa chấm',
    icon: 'rate_review',
    actionLabel: 'Chấm điểm',
  };
}

export function ExamSubmissions({ classId, examId, isPublished }: ExamSubmissionsProps) {
  const navigate = useNavigate();
  const { submissions, isLoading } = useExamSubmissions(classId, examId, isPublished);

  if (!isPublished) {
    return (
      <div className="page-state page-state--soft">
        <span className="material-symbols-outlined page-state__icon" aria-hidden="true">visibility_off</span>
        <p>Đề thi này chưa được xuất bản. Học sinh chưa thể làm bài.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="exam-submissions__grid" aria-label="Đang tải bài nộp">
        {[1, 2, 3].map((item) => (
          <div key={item} className="skeleton-card" aria-hidden="true">
            <div className="skeleton-line skeleton-line--lg" />
            <div className="skeleton-line skeleton-line--md" />
            <div className="skeleton-line skeleton-line--sm" />
            <div className="skeleton-chip" />
          </div>
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="page-state page-state--soft">
        <span className="material-symbols-outlined page-state__icon" aria-hidden="true">inbox</span>
        <p>Chưa có học sinh nào nộp bài.</p>
      </div>
    );
  }

  const decoratedSubmissions = submissions
    .map((submission) => ({
      submission,
      state: getSubmissionState(submission),
      totalScore: toNumber(submission.totalScore),
      maxScore: toNumber(submission.maxScore),
    }))
    .sort((a, b) => {
      if (a.state.isGraded !== b.state.isGraded) {
        return a.state.isGraded ? 1 : -1;
      }

      return new Date(b.submission.submittedAt).getTime() - new Date(a.submission.submittedAt).getTime();
    });
  const pendingCount = decoratedSubmissions.filter((item) => !item.state.isGraded).length;
  const gradedCount = submissions.length - pendingCount;

  return (
    <div className="exam-submissions">
      <div className="exam-submissions__heading">
        <h3 className="exam-submissions__title">Danh sách bài nộp ({submissions.length})</h3>
        <div className="exam-submissions__status-summary" aria-label="Tổng quan trạng thái bài nộp">
          <span className="exam-submissions__status-chip exam-submissions__status-chip--pending">Chưa chấm {pendingCount}</span>
          <span className="exam-submissions__status-chip exam-submissions__status-chip--graded">Đã chấm {gradedCount}</span>
        </div>
      </div>
      
      <div className="exam-submissions__grid">
        {decoratedSubmissions.map(({ submission: sub, state: submissionState, totalScore, maxScore }) => {
          return (
            <article key={sub.studentId} className={`exam-submission-card ${submissionState.className}`}>
              <div className="exam-submission-card__status">
                <span className="material-symbols-outlined" aria-hidden="true">{submissionState.icon}</span>
                {submissionState.label}
              </div>

              <div className="exam-submission-card__head">
                <div>
                  <h4 className="exam-submission-card__name">{sub.studentName}</h4>
                  <p className="exam-submission-card__email">{sub.studentEmail || 'Chưa có email'}</p>
                </div>
                <div className="exam-submission-card__score" aria-label="Điểm bài nộp">
                  <span>{submissionState.isGraded ? 'Điểm' : 'Tạm tính'}</span>
                  <strong>
                    {totalScore}
                    {maxScore > 0 && <small>/{maxScore}</small>}
                  </strong>
                </div>
              </div>

              <div className="exam-submission-card__meta">
                <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                {new Date(sub.submittedAt).toLocaleString('vi-VN')}
              </div>

              <div className="exam-submission-card__footer">
                <button
                  className="teacher-btn-outline"
                  type="button"
                  onClick={() => navigate(`/teacher/classes/${classId}/exams/${examId}/grade/${sub.studentId}`)}
                >
                  {submissionState.actionLabel}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
