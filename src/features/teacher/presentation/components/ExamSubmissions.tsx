import { useNavigate } from 'react-router-dom';
import { useExamSubmissions } from '../../application/useExamSubmissions';

type ExamSubmissionsProps = {
  classId: string;
  examId: string;
  isPublished: boolean;
};

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

  return (
    <div className="exam-submissions">
      <h3 className="exam-submissions__title">Danh sách bài nộp ({submissions.length})</h3>
      
      <div className="exam-submissions__grid">
        {submissions.map(sub => (
          <article key={sub.studentId} className="exam-submission-card">
            <div className="exam-submission-card__head">
              <div>
                <h4 className="exam-submission-card__name">{sub.studentName}</h4>
                <p className="exam-submission-card__email">{sub.studentEmail || 'Chưa có email'}</p>
              </div>
              <div className="exam-submission-card__score">
                {sub.totalScore || 0}
              </div>
            </div>
            
            <p className="exam-submission-card__date">
              Nộp lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')}
            </p>
            
            <div className="exam-submission-card__footer">
              <button 
                className="teacher-btn-outline" 
                type="button"
                onClick={() => navigate(`/teacher/classes/${classId}/exams/${examId}/grade/${sub.studentId}`)}
              >
                Chấm điểm / Xem chi tiết
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
