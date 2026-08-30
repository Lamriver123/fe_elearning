import { ClassCard } from './ClassCard'
import type { ClassInfo } from '../../domain/teacher.types'

type ClassListProps = {
  classes: ClassInfo[]
  isLoading: boolean
  error: string | null
}

function ClassCardSkeleton() {
  return (
    <div className="teacher-class-card teacher-class-card--skeleton" aria-hidden="true">
      <div className="teacher-class-card__image-wrapper">
        <div className="teacher-class-card__placeholder">
          <span className="skeleton-line teacher-class-card-skeleton__icon" />
        </div>
        <div className="teacher-class-card__overlay" />
        <span className="teacher-class-card__badge teacher-class-card__badge--code">
          <span className="skeleton-line teacher-class-card-skeleton__badge-icon" />
          <span className="skeleton-line teacher-class-card-skeleton__badge-code" />
        </span>
        <span className="teacher-class-card__badge teacher-class-card__badge--ongoing">
          <span className="teacher-class-card__badge-dot teacher-class-card__badge-dot--ongoing" />
          <span className="skeleton-line teacher-class-card-skeleton__badge-status" />
        </span>
      </div>

      <div className="teacher-class-card__content">
        <span className="skeleton-line teacher-class-card-skeleton__title" />
        <div className="teacher-class-card__info">
          <span className="teacher-class-card__info-item">
            <span className="skeleton-line teacher-class-card-skeleton__mini-icon" />
            <span className="skeleton-line teacher-class-card-skeleton__meta" />
          </span>
          <span className="teacher-class-card__dot" />
          <span className="teacher-class-card__info-item">
            <span className="skeleton-line teacher-class-card-skeleton__mini-icon" />
            <span className="skeleton-line teacher-class-card-skeleton__meta teacher-class-card-skeleton__meta--wide" />
          </span>
        </div>
        <div className="teacher-class-card__footer">
          <span className="teacher-class-card__action teacher-class-card-skeleton__action">
            <span className="skeleton-line teacher-class-card-skeleton__action-line" />
          </span>
        </div>
      </div>
    </div>
  )
}

export function ClassList({ classes, isLoading, error }: ClassListProps) {
  if (isLoading) {
    return (
      <div className="teacher-class-grid teacher-class-grid--loading" aria-label="Đang tải danh sách lớp học">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <ClassCardSkeleton key={n} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-state page-state--error">
        <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
        <p>{error}</p>
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <div className="page-state">
        <span className="material-symbols-outlined page-state__icon" aria-hidden="true">school</span>
        <h3 className="page-state__title">Chưa có lớp học nào</h3>
        <p>Hãy tạo lớp học mới để bắt đầu giảng dạy.</p>
      </div>
    )
  }

  return (
    <div className="teacher-class-grid">
      {classes.map((cls) => (
        <ClassCard key={cls.id} classInfo={cls} />
      ))}
    </div>
  )
}
