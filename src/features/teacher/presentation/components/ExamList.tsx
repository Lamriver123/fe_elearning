import { useNavigate } from 'react-router-dom';
import { useExams } from '../../application/useExams.js';

type ExamListProps = {
  classId: string;
};

export function ExamList({ classId }: ExamListProps) {
  const { exams, isLoading, error, deleteExam } = useExams(classId);
  const navigate = useNavigate();

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa đề thi này không? Mọi dữ liệu liên quan và bài làm của học sinh sẽ bị xóa vĩnh viễn.')) {
      return;
    }
    void deleteExam(examId);
  };

  if (isLoading) {
    return (
      <div className="teacher-exam-grid" aria-label="Đang tải danh sách đề thi">
        {[1, 2, 3].map((item) => (
          <div key={item} className="skeleton-card" aria-hidden="true">
            <div className="skeleton-line skeleton-line--lg" />
            <div className="skeleton-line skeleton-line--md" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--sm" />
            <div className="skeleton-chip" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state page-state--error">
        <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="teacher-exam-list">
      <div className="teacher-page-header teacher-exam-list__header">
        <div>
          <h2>Danh sách đề thi & bài kiểm tra</h2>
        </div>
        <button 
          className="teacher-btn-primary" 
          type="button"
          onClick={() => navigate(`/teacher/classes/${classId}/exams/create`)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          Tạo đề thi
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="page-state">
          <span className="material-symbols-outlined page-state__icon" aria-hidden="true">assignment</span>
          <h3 className="page-state__title">Lớp học chưa có đề thi nào</h3>
          <p>Tạo đề thi mới bằng nút "Tạo đề thi" ở trên.</p>
        </div>
      ) : (
        <div className="teacher-exam-grid">
          {exams.map(exam => (
            <article key={exam.id} className="teacher-exam-card">
              <div className="teacher-exam-card__header">
                <div className="teacher-exam-card__icon" aria-hidden="true">
                  <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
                </div>
                <span className={`status-pill ${exam.status === 'PUBLISHED' ? 'status-pill--published' : 'status-pill--draft'}`}>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {exam.status === 'PUBLISHED' ? 'check_circle' : 'edit'}
                  </span>
                  {exam.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>
              
              <div className="teacher-exam-card__body">
                <h3 className="teacher-exam-card__title">{exam.title}</h3>
                {exam.description ? (
                  <p className="teacher-exam-card__description text-clamp-2">
                    {exam.description}
                  </p>
                ) : (
                  <p className="teacher-exam-card__description teacher-exam-card__description--muted">Chưa có mô tả</p>
                )}
              </div>

              <div className="teacher-exam-card__created">
                <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
                <span>Tạo lúc: {new Date(exam.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="teacher-exam-card__meta">
                <span className="metric-pill">
                  <span className="material-symbols-outlined" aria-hidden="true">timer</span>
                  {exam.classSettings?.durationMinutes ? `${exam.classSettings.durationMinutes} phút` : 'Không giới hạn thời gian'}
                </span>
                <span className="metric-pill">
                  <span className="material-symbols-outlined" aria-hidden="true">category</span>
                  {exam.skillType}
                </span>
              </div>
              
              <div className="teacher-exam-card__footer">
                <button 
                  className="teacher-btn-outline" 
                  type="button"
                  onClick={() => navigate(`/teacher/classes/${classId}/exams/${exam.id}`)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
                  Chi tiết
                </button>
                <button 
                  className="teacher-btn-primary" 
                  type="button"
                  onClick={() => navigate(`/teacher/classes/${classId}/exams/${exam.id}`)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                  Sửa đề
                </button>
                <button 
                  className="teacher-btn-outline teacher-btn-danger" 
                  type="button"
                  onClick={() => handleDeleteExam(exam.id)}
                  title="Xóa đề thi"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
