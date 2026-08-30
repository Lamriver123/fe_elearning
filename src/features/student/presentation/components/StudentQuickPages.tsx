import { Link } from 'react-router-dom'
import { useStudentClasses } from '../../application/useStudentClasses'

export function StudentAllExamsPage() {
  const { classes, isLoading, error } = useStudentClasses()
  const approvedClasses = classes.filter((classInfo) => classInfo.memberStatus === 'APPROVED')

  return (
    <div className="student-quick-page">
      <div className="student-quick-page__hero">
        <span className="student-page-kicker">
          <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
          Trung tâm luyện đề
        </span>
        <h2>Đề thi của tôi</h2>
        <p>Chọn một lớp đang học để xem các bài kiểm tra giáo viên đã giao.</p>
      </div>

      {isLoading ? (
        <div className="student-quick-grid" aria-hidden="true">
          {[1, 2, 3].map((item) => (
            <div className="student-quick-card student-quick-card--loading" key={item}>
              <span className="skeleton-avatar" />
              <span className="skeleton-line skeleton-line--lg" />
              <span className="skeleton-line skeleton-line--md" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="page-state page-state--error">
          <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
          <p>{error}</p>
        </div>
      ) : approvedClasses.length > 0 ? (
        <div className="student-quick-grid">
          {approvedClasses.map((classInfo) => (
            <Link className="student-quick-card student-quick-card--exam" to={`/student/courses/${classInfo.id}/exams`} key={classInfo.id}>
              <span className="material-symbols-outlined" aria-hidden="true">assignment</span>
              <strong>{classInfo.name}</strong>
              <small>{classInfo.teacherName}</small>
              <em>Vào danh sách đề</em>
            </Link>
          ))}
        </div>
      ) : (
        <div className="student-empty-hero">
          <span className="material-symbols-outlined" aria-hidden="true">assignment</span>
          <h3>Chưa có lớp để xem đề thi</h3>
          <p>Tham gia một lớp học trước, các bài kiểm tra sẽ xuất hiện tại đây.</p>
          <Link to="/student/courses">Tìm lớp học</Link>
        </div>
      )}
    </div>
  )
}

export function StudentNotificationsPage() {
  return (
    <div className="student-quick-page">
      <div className="student-quick-page__hero student-quick-page__hero--notice">
        <span className="student-page-kicker">
          <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
          Hộp thông báo
        </span>
        <h2>Thông báo</h2>
        <p>Các lời mời lớp học, nhận xét bài làm và nhắc lịch học sẽ được gom tại đây.</p>
      </div>

      <div className="student-empty-hero student-empty-hero--notice">
        <span className="material-symbols-outlined" aria-hidden="true">notifications_active</span>
        <h3>Chưa có thông báo mới</h3>
        <p>Khi giáo viên gửi lời mời hoặc phản hồi bài học, bạn sẽ nhìn thấy ngay tại đây.</p>
      </div>
    </div>
  )
}
