import type { AuthUser } from '../../../auth/domain/auth.types'

type TeacherHeaderProps = {
  user: AuthUser
  onMenuClick?: () => void
}

export function TeacherHeader({ user, onMenuClick }: TeacherHeaderProps) {
  return (
    <header className="teacher-header">
      <div className="teacher-header__left">
        <div className="teacher-header__mobile-menu">
          <button className="teacher-header__icon-btn" type="button" onClick={onMenuClick} aria-label="Mở menu">
            <span className="material-symbols-outlined" aria-hidden="true">menu</span>
          </button>
        </div>
        <div className="header-brand-mobile-only teacher-header__mobile-brand">
          E-Learning
        </div>
        <div className="header-brand-mobile-only teacher-header__role-badge">
          Giáo viên
        </div>
      </div>

      <div className="teacher-header__right">
        <span className="teacher-header__user-name hide-on-mobile">
          {user.fullName}
        </span>
        <div className="teacher-header__avatar">
          <img 
            alt="User avatar" 
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
          />
        </div>
      </div>
    </header>
  )
}
