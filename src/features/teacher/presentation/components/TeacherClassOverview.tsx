import { toast } from 'react-hot-toast'
import { useTeacherClassDetail } from '../../application/useTeacherClassDetail'
import type { TeacherClassDetailInfo } from '../../domain/teacher.types'

type TeacherClassOverviewProps = {
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

function TeacherClassOverviewContent({ classDetail }: { classDetail: TeacherClassDetailInfo }) {
  const status = getClassStatus(classDetail.status)

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(classDetail.inviteCode)
      toast.success(`Đã copy mã lớp: ${classDetail.inviteCode}`)
    } catch {
      toast.error('Không thể copy mã lớp')
    }
  }

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
            <span className={`status-pill ${status.className}`}>{status.label}</span>
            <button className="metric-pill class-overview__copy-code" type="button" onClick={copyInviteCode}>
              <span className="material-symbols-outlined" aria-hidden="true">content_copy</span>
              <span className="class-overview__code-text">{classDetail.inviteCode}</span>
            </button>
          </div>

          <h2 className="class-overview__title">{classDetail.name}</h2>
          <p className="class-overview__description">
            {classDetail.description || 'Lớp học này chưa có mô tả.'}
          </p>
        </div>
      </section>

      <div className="class-overview__metrics">
        <ClassMetric icon="groups" label="Học sinh đã duyệt" value={classDetail.studentsCount ?? 0} />
        <ClassMetric icon="event" label="Ngày tạo lớp" value={formatDate(classDetail.createdAt)} />
        <ClassMetric icon="person" label="Giáo viên phụ trách" value={classDetail.teacherName || 'Bạn'} />
      </div>

      <section className="class-overview__details surface-card">
        <h3>Thông tin lớp học</h3>
        <dl className="class-overview__detail-list">
          <DetailRow label="Tên lớp" value={classDetail.name} />
          <DetailRow label="Mã lớp" value={classDetail.inviteCode} />
          <DetailRow label="Trạng thái" value={status.label} />
          <DetailRow label="Số học sinh đã duyệt" value={classDetail.studentsCount ?? 0} />
          <DetailRow label="Giáo viên" value={classDetail.teacherName || 'Bạn'} />
          <DetailRow label="Email giáo viên" value={classDetail.teacherEmail} />
          <DetailRow label="Ngày tạo" value={formatDateTime(classDetail.createdAt)} />
        </dl>
      </section>
    </div>
  )
}

export function TeacherClassOverview({ classId }: TeacherClassOverviewProps) {
  const { classDetail, isLoading, error } = useTeacherClassDetail(classId)

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
      <div className="page-state">
        <span className="material-symbols-outlined page-state__icon" aria-hidden="true">info</span>
        <h3 className="page-state__title">Không có thông tin lớp học</h3>
      </div>
    )
  }

  return <TeacherClassOverviewContent classDetail={classDetail} />
}
