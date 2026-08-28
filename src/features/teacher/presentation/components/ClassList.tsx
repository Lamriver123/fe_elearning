import { ClassCard } from './ClassCard'
import type { ClassInfo } from '../../domain/teacher.types'

type ClassListProps = {
  classes: ClassInfo[]
  isLoading: boolean
  error: string | null
}

export function ClassList({ classes, isLoading, error }: ClassListProps) {
  if (isLoading) {
    return (
      <div className="teacher-class-grid">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton-card" aria-hidden="true">
            <div className="skeleton-thumb" />
            <div className="skeleton-line skeleton-line--lg" />
            <div className="skeleton-line skeleton-line--md" />
            <div className="skeleton-line skeleton-line--sm" />
            <div className="skeleton-chip" />
          </div>
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
