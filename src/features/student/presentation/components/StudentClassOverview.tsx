import { useStudentClassDetail } from '../../application/useStudentClassDetail'
import type { StudentClassDetailInfo } from '../../domain/studentClasses.types'

type StudentClassOverviewProps = {
  classId: string
}

function formatDateTime(dateValue?: string) {
  if (!dateValue) return 'Chưa cập nhật'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'

  const day = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
  const time = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  return `${day} lúc ${time}`
}

function formatDate(dateValue?: string) {
  if (!dateValue) return 'Chưa cập nhật'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getClassStatus(status: string) {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Đang hoạt động', className: 'status-pill--success' }
    case 'DELETE':
      return { label: 'Đã xóa', className: 'status-pill--danger' }
    default:
      return { label: status || 'Chưa cập nhật', className: 'status-pill--info' }
  }
}

function getMemberStatus(status: string) {
  switch (status) {
    case 'APPROVED':
      return { label: 'Đã tham gia', className: 'status-pill--success' }
    case 'PENDING':
      return { label: 'Đang chờ duyệt', className: 'status-pill--warning' }
    case 'INVITED':
      return { label: 'Được mời', className: 'status-pill--info' }
    case 'REJECTED':
      return { label: 'Đã từ chối', className: 'status-pill--danger' }
    default:
      return { label: status || 'Chưa cập nhật', className: 'status-pill--info' }
  }
}

function ClassOverviewSkeleton() {
  return (
    <div className="class-overview class-overview--loading" aria-label="Đang tải thông tin lớp học">
      <section className="class-overview__hero surface-card" aria-hidden="true">
        <span className="class-overview__poster-skeleton skeleton-thumb" />
        <div className="class-overview__hero-content">
          <span className="skeleton-chip" />
          <span className="skeleton-line skeleton-line--lg" />
          <span className="skeleton-line" />
          <span className="skeleton-line skeleton-line--md" />
        </div>
      </section>

      <div className="class-overview__metrics" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <div key={item} className="class-overview__metric surface-card">
            <span className="skeleton-avatar" />
            <div className="class-overview__metric-copy">
              <span className="skeleton-line skeleton-line--md" />
              <span className="skeleton-line skeleton-line--sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ClassMetric({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <article className="class-overview__metric surface-card">
      <span className="material-symbols-outlined class-overview__metric-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="class-overview__metric-copy">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  const displayValue = value === undefined || value === null || value === '' ? 'Chưa cập nhật' : value

  return (
    <div className="class-overview__detail-row">
      <dt>{label}</dt>
      <dd>{displayValue}</dd>
    </div>
  )
}

function StudentClassOverviewContent({ classDetail }: { classDetail: StudentClassDetailInfo }) {
  const classStatus = getClassStatus(classDetail.status)
  const memberStatus = getMemberStatus(classDetail.memberStatus)

  return (
    <div className="class-overview">
      <section className="class-overview__hero surface-card">
        <div className="class-overview__poster-frame">
          {classDetail.poster ? (
            <img src={classDetail.poster} alt={classDetail.name} className="class-overview__poster" />
          ) : (
            <div className="class-overview__poster-placeholder">
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
            </div>
          )}
        </div>

        <div className="class-overview__hero-content">
          <div className="class-overview__badges">
            <span className={`status-pill ${memberStatus.className}`}>{memberStatus.label}</span>
            <span className={`status-pill ${classStatus.className}`}>{classStatus.label}</span>
          </div>

          <h2 className="class-overview__title">{classDetail.name}</h2>
          <p className="class-overview__description">
            {classDetail.description || 'Lớp học này chưa có mô tả.'}
          </p>
        </div>
      </section>

      <div className="class-overview__metrics">
        <ClassMetric icon="person" label="Giáo viên phụ trách" value={classDetail.teacherName || 'Chưa cập nhật'} />
        <ClassMetric icon="event_available" label="Ngày tham gia" value={formatDate(classDetail.joinedAt)} />
        <ClassMetric icon="groups" label="Học sinh trong lớp" value={classDetail.studentsCount ?? 0} />
      </div>

      <section className="class-overview__details surface-card">
        <h3>Thông tin lớp học</h3>
        <dl className="class-overview__detail-list">
          <DetailRow label="Tên lớp" value={classDetail.name} />
          <DetailRow label="Giáo viên" value={classDetail.teacherName} />
          <DetailRow label="Email giáo viên" value={classDetail.teacherEmail} />
          <DetailRow label="Mã lớp" value={classDetail.inviteCode} />
          <DetailRow label="Trạng thái lớp" value={classStatus.label} />
          <DetailRow label="Trạng thái tham gia" value={memberStatus.label} />
          <DetailRow label="Ngày tạo lớp" value={formatDateTime(classDetail.createdAt)} />
          <DetailRow label="Ngày tham gia" value={formatDateTime(classDetail.joinedAt)} />
        </dl>
      </section>
    </div>
  )
}

export function StudentClassOverview({ classId }: StudentClassOverviewProps) {
  const { classDetail, isLoading, error } = useStudentClassDetail(classId)

  if (isLoading) {
    return <ClassOverviewSkeleton />
  }

  if (error) {
    return (
      <div className="page-state page-state--error">
        <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
        <p>{error}</p>
      </div>
    )
  }

  if (!classDetail) {
    return (
      <div className="page-state student-class-detail__empty">
        <span className="material-symbols-outlined page-state__icon" aria-hidden="true">info</span>
        <h3 className="page-state__title">Không có thông tin lớp học</h3>
      </div>
    )
  }

  return <StudentClassOverviewContent classDetail={classDetail} />
}
