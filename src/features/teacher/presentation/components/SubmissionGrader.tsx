import { useParams, useNavigate } from 'react-router-dom';
import { useSubmissionGrader } from '../../application/useSubmissionGrader';

function SubmissionGraderSkeleton() {
  return (
    <div
      className="teacher-content-container submission-grader-skeleton"
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

  const handleScoreChange = (answerId: string, newScore: number) => {
    updateScore(answerId, newScore);
  };

  const handleCommentChange = (answerId: string, comment: string) => {
    updateComment(answerId, comment);
  };

  const handleSaveGrades = async () => {
    const success = await saveGrades();
    if (success && classId && examId) {
      navigate(`/teacher/classes/${classId}/exams/${examId}`);
    }
  };

  if (isLoading) {
    return <SubmissionGraderSkeleton />;
  }

  if (!result) {
    return (
      <div className="teacher-content-container">
        <div className="page-state page-state--error">
          <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
          <p>Không tìm thấy bài nộp</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-content-container">
      <div className="teacher-page-header">
        <div>
          <button 
            className="teacher-btn-outline back-button" 
            type="button"
            onClick={() => navigate(`/teacher/classes/${classId}/exams/${examId}`)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Trở lại đề thi
          </button>
          <h1>Chấm bài học sinh</h1>
        </div>
        <div className="page-action-row page-action-row--end">
          <div className="submission-grader__score">
            Điểm hiện tại: {currentTotal}
          </div>
          <button 
            className="teacher-btn-primary" 
            type="button"
            onClick={handleSaveGrades}
            disabled={isSaving}
          >
            {isSaving ? 'Đang lưu...' : 'Hoàn tất chấm điểm'}
          </button>
        </div>
      </div>

      <div className="submission-grader__answers">
        {result.answers.map((ans, idx) => {
          const maxPoints = ans.question.points || 0;
          return (
            <article key={ans.id} className="submission-grader__card">
              <div className="submission-grader__question-head">
                <h4 className="submission-grader__question-title">Câu {idx + 1}:</h4>
                <div className="submission-grader__question-meta">
                  <span>Tối đa: {maxPoints} điểm</span>
                  {!ans.isAutoGraded && (
                    <span className="status-pill status-pill--warning">Cần chấm</span>
                  )}
                </div>
              </div>
              
              <p className="submission-grader__question-content">{ans.question.content}</p>

              {ans.question.questionType === 'MULTIPLE_CHOICE' && (
                <div className="submission-grader__answer-box">
                  <p>
                    Câu hỏi trắc nghiệm đã được tự động chấm điểm.
                  </p>
                </div>
              )}

              {ans.question.questionType === 'ESSAY' && (
                <div className="submission-grader__answer-box">
                  <p>{ans.textAnswer || 'Không có câu trả lời'}</p>
                </div>
              )}

              {ans.question.questionType === 'AUDIO_RESPONSE' && ans.fileUrl && (
                <div className="submission-grader__answer-box">
                  <audio controls src={ans.fileUrl} />
                </div>
              )}

              <div className="submission-grader__grading-row">
                <div className="submission-grader__score-field">
                  <label className="form-label">Chấm điểm</label>
                  <div className="submission-grader__score-control">
                    <input 
                      type="number"
                      min={0}
                      max={maxPoints}
                      value={grades[ans.id]?.score ?? 0}
                      onChange={(e) => handleScoreChange(ans.id, parseFloat(e.target.value) || 0)}
                      className="form-input submission-grader__score-input"
                    />
                    <span className="metric-pill">/ {maxPoints}</span>
                  </div>
                </div>
                
                <div className="submission-grader__comment-field">
                  <label className="form-label">Nhận xét (Tùy chọn)</label>
                  <textarea 
                    rows={2}
                    placeholder="Nhận xét của giáo viên..."
                    value={grades[ans.id]?.comment || ''}
                    onChange={(e) => handleCommentChange(ans.id, e.target.value)}
                    className="form-textarea"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
