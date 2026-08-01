import type { AuthUser } from '../../../auth/domain/auth.types'

type TeacherHeaderProps = {
  user: AuthUser
}

export function TeacherHeader({ user }: TeacherHeaderProps) {
  return (
    <header className="teacher-header">
      <div className="teacher-header__mobile-menu">
        <button className="teacher-header__icon-btn">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <div className="teacher-header__brand">
        E-Learning
      </div>

      <div className="teacher-header__actions">
        <button className="teacher-header__icon-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="teacher-header__icon-btn" style={{ display: 'none' /* hidden by default on small screens, adjust with CSS if needed */ }}>
          <span className="material-symbols-outlined">settings</span>
        </button>
        
        <div className="teacher-header__avatar">
          <img 
            src={user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOIo1XJ8FTYJpMjoSZxPRD0Ap8-p82eVkY4NuAVzqQcaRNoYl5JxpxDBD67lGNlDJmw9bkD3m8zoIGlZuGfwd4oxbQiGcU6IASnPC2lndC_dJzgwGMLtD9xBxUDlnwOHqtWn4PMKf6nJDxGSc2WLfRzCwc_4aSunzSATKhFetPKWHy385h9HnDXNAoOrtegSYKY0V1OL5ozXNjzqv08LRB76QVpSDXOyv2oxZGJolwJnbzOBwcBC4Eeg'} 
            alt="User avatar" 
          />
        </div>
      </div>
    </header>
  )
}
