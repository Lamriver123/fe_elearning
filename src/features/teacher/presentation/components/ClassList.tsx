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
          <div key={n} style={{ height: '300px', backgroundColor: 'var(--color-surface-soft)', borderRadius: '12px', animation: 'pulse 2s infinite' }}></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-error)', backgroundColor: 'rgba(186, 26, 26, 0.1)', borderRadius: '12px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px' }}>error</span>
        <p>{error}</p>
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-muted-soft)', marginBottom: '16px' }}>school</span>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>Chưa có lớp học nào</h3>
        <p style={{ color: 'var(--color-muted)' }}>Hãy tạo lớp học mới để bắt đầu giảng dạy.</p>
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
