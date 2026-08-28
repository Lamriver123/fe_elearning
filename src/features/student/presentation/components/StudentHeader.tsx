import type { AuthUser } from '../../../auth/domain/auth.types.ts'

type StudentHeaderProps = {
  user: AuthUser
  onMenuClick?: () => void
}

export function StudentHeader({ user, onMenuClick }: StudentHeaderProps) {
  return (
    <header className="student-header">
      <div className="student-header__left">
        <div className="student-header__mobile-menu">
          <button className="student-header__icon-btn" type="button" onClick={onMenuClick} aria-label="Mở menu">
            <span className="material-symbols-outlined" aria-hidden="true">menu</span>
          </button>
        </div>
        <div className="header-brand-mobile-only student-header__mobile-brand">
          E-Learning
        </div>
        <div className="header-brand-mobile-only student-header__role-badge">
          Học viên
        </div>
      </div>

      <div className="student-header__right">
        <span className="student-header__user-name hide-on-mobile">
          {user.fullName}
        </span>
        <button className="student-header__avatar" type="button" aria-label="Tài khoản">
          <img 
            alt="User Avatar" 
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
          />
        </button>
      </div>
    </header>
  )
}
