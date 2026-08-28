import { Link } from 'react-router-dom';
import { useStudentExams } from '../../application/useStudentExams';
import type { StudentExamInfo } from '../../domain/studentExam.types';

type StudentExamListProps = {
  classId: string;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatRelativeDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Đã qua';
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  if (diffDays <= 7) return `Còn ${diffDays} ngày`;
  return formatDate(dateStr);
}

function getExamStatus(exam: StudentExamInfo): { label: string; className: string; icon: string } {
  if (exam.isSubmitted) {
    return { label: 'Đã nộp', className: 'exam-timeline-status--submitted', icon: 'task_alt' };
  }
  
  const endTime = exam.classSettings?.endTime;
  if (endTime && new Date(endTime) < new Date()) {
    return { label: 'Hết hạn', className: 'exam-timeline-status--expired', icon: 'event_busy' };
  }
  
  const startTime = exam.classSettings?.startTime;
  if (startTime && new Date(startTime) > new Date()) {
    return { label: 'Sắp diễn ra', className: 'exam-timeline-status--upcoming', icon: 'schedule' };
  }
  
  return { label: 'Chưa làm', className: 'exam-timeline-status--pending', icon: 'edit_note' };
}

function getSkillIcon(skillType?: string) {
  switch (skillType) {
    case 'READING': return 'menu_book';
    case 'LISTENING': return 'headphones';
    case 'SPEAKING': return 'mic';
    case 'WRITING': return 'edit';
    default: return 'quiz';
  }
}

function getSkillLabel(skillType?: string) {
  switch (skillType) {
    case 'READING': return 'Reading';
    case 'LISTENING': return 'Listening';
    case 'SPEAKING': return 'Speaking';
    case 'WRITING': return 'Writing';
    default: return 'Tổng hợp';
  }
}

export function StudentExamList({ classId }: StudentExamListProps) {
  const { exams, isLoading, error } = useStudentExams(classId);

  if (isLoading) {
    return (
      <div className="exam-timeline-loading" aria-label="Đang tải danh sách bài thi">
        <div className="exam-timeline-summary">
          {[1, 2, 3].map((item) => (
            <div key={item} className="exam-timeline-summary__item">
              <span className="skeleton-avatar" aria-hidden="true" />
              <div>
                <span className="skeleton-line skeleton-line--sm" />
                <span className="skeleton-line" />
              </div>
            </div>
          ))}
        </div>
        <div className="exam-timeline-list">
          {[1, 2].map((item) => (
            <div key={item} className="exam-timeline-item">
              <div className="exam-timeline-item__connector">
                <div className="skeleton-avatar" />
                {item === 1 && <div className="exam-timeline-item__line" />}
              </div>
              <div className="exam-timeline-item__card skeleton-card" aria-hidden="true">
                <div className="skeleton-line skeleton-line--lg" />
                <div className="skeleton-line skeleton-line--md" />
                <div className="skeleton-chip" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-timeline-error">
        <span className="material-symbols-outlined" aria-hidden="true">error</span>
        Lỗi: {error}
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="exam-timeline-empty">
        <span className="material-symbols-outlined exam-timeline-empty__icon" aria-hidden="true">assignment</span>
        <h3 className="exam-timeline-empty__title">Chưa có bài thi nào</h3>
        <p className="exam-timeline-empty__desc">Giáo viên của bạn chưa giao bài thi nào cho lớp này.</p>
      </div>
    );
  }

  // Sort: pending first, then upcoming, then submitted, then expired
  const sortedExams = [...exams].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'Chưa làm': 0,
      'Sắp diễn ra': 1,
      'Đã nộp': 2,
      'Hết hạn': 3,
    };
    const aStatus = getExamStatus(a).label;
    const bStatus = getExamStatus(b).label;
    return (statusOrder[aStatus] ?? 99) - (statusOrder[bStatus] ?? 99);
  });

  const pendingCount = sortedExams.filter(e => !e.isSubmitted && !(e.classSettings?.endTime && new Date(e.classSettings.endTime) < new Date())).length;
  const submittedCount = sortedExams.filter(e => e.isSubmitted).length;

  return (
    <div className="exam-timeline">
      {/* Summary bar */}
      <div className="exam-timeline-summary">
        <div className="exam-timeline-summary__item">
          <span className="material-symbols-outlined exam-timeline-summary__icon exam-timeline-summary__icon--total" aria-hidden="true">assignment</span>
          <div>
            <span className="exam-timeline-summary__number">{exams.length}</span>
            <span className="exam-timeline-summary__label">Tổng bài thi</span>
          </div>
        </div>
        <div className="exam-timeline-summary__divider" />
        <div className="exam-timeline-summary__item">
          <span className="material-symbols-outlined exam-timeline-summary__icon exam-timeline-summary__icon--pending" aria-hidden="true">edit_note</span>
          <div>
            <span className="exam-timeline-summary__number">{pendingCount}</span>
            <span className="exam-timeline-summary__label">Cần làm</span>
          </div>
        </div>
        <div className="exam-timeline-summary__divider" />
        <div className="exam-timeline-summary__item">
          <span className="material-symbols-outlined exam-timeline-summary__icon exam-timeline-summary__icon--done" aria-hidden="true">task_alt</span>
          <div>
            <span className="exam-timeline-summary__number">{submittedCount}</span>
            <span className="exam-timeline-summary__label">Đã hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Timeline list */}
      <div className="exam-timeline-list">
        {sortedExams.map((exam, idx) => {
          const status = getExamStatus(exam);
          const isLast = idx === sortedExams.length - 1;
          
          return (
            <div key={exam.id} className={`exam-timeline-item ${status.className}`}>
              {/* Timeline connector */}
              <div className="exam-timeline-item__connector">
                <div className={`exam-timeline-item__dot ${status.className}`}>
                  <span className="material-symbols-outlined" aria-hidden="true">{status.icon}</span>
                </div>
                {!isLast && <div className="exam-timeline-item__line" />}
              </div>

              {/* Card content */}
              <div className="exam-timeline-item__card">
                <div className="exam-timeline-item__header">
                  <div className="exam-timeline-item__title-row">
                    <h3 className="exam-timeline-item__title">{exam.title}</h3>
                    <span className={`exam-timeline-item__badge ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  {exam.description && (
                    <p className="exam-timeline-item__desc">{exam.description}</p>
                  )}
                </div>

                <div className="exam-timeline-item__meta">
                  <div className="exam-timeline-item__meta-chip">
                    <span className="material-symbols-outlined" aria-hidden="true">{getSkillIcon(exam.skillType)}</span>
                    {getSkillLabel(exam.skillType)}
                  </div>
                  {exam.classSettings?.durationMinutes && (
                    <div className="exam-timeline-item__meta-chip">
                      <span className="material-symbols-outlined" aria-hidden="true">timer</span>
                      {exam.classSettings.durationMinutes} phút
                    </div>
                  )}
                  {exam.totalPoints != null && exam.totalPoints > 0 && (
                    <div className="exam-timeline-item__meta-chip">
                      <span className="material-symbols-outlined" aria-hidden="true">star</span>
                      {exam.totalPoints} điểm
                    </div>
                  )}
                </div>

                {/* Time milestones */}
                <div className="exam-timeline-item__milestones">
                  {exam.createdAt && (
                    <div className="exam-timeline-item__milestone">
                      <span className="material-symbols-outlined" aria-hidden="true">event</span>
                      <span className="exam-timeline-item__milestone-label">Tạo:</span>
                      <span>{formatDate(exam.createdAt)} lúc {formatTime(exam.createdAt)}</span>
                    </div>
                  )}
                  {exam.classSettings?.startTime && (
                    <div className="exam-timeline-item__milestone">
                      <span className="material-symbols-outlined" aria-hidden="true">play_circle</span>
                      <span className="exam-timeline-item__milestone-label">Mở:</span>
                      <span>{formatDate(exam.classSettings.startTime)} lúc {formatTime(exam.classSettings.startTime)}</span>
                    </div>
                  )}
                  {exam.classSettings?.endTime && (
                    <div className="exam-timeline-item__milestone">
                      <span className="material-symbols-outlined" aria-hidden="true">stop_circle</span>
                      <span className="exam-timeline-item__milestone-label">Đóng:</span>
                      <span>{formatDate(exam.classSettings.endTime)} lúc {formatTime(exam.classSettings.endTime)}</span>
                      {formatRelativeDate(exam.classSettings.endTime) && (
                        <span className="exam-timeline-item__milestone-relative">
                          ({formatRelativeDate(exam.classSettings.endTime)})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="exam-timeline-item__actions">
                  <Link 
                    to={`/student/courses/${classId}/exams/${exam.id}${exam.isSubmitted ? '/result' : ''}`} 
                    className="exam-timeline-item__action-link"
                  >
                    <button className={`exam-timeline-item__btn ${exam.isSubmitted ? 'exam-timeline-item__btn--secondary' : 'exam-timeline-item__btn--primary'}`}>
                      <span className="material-symbols-outlined" aria-hidden="true">
                        {exam.isSubmitted ? 'visibility' : 'play_arrow'}
                      </span>
                      {exam.isSubmitted ? 'Xem kết quả' : 'Bắt đầu làm bài'}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
