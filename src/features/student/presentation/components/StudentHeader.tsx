import type { AuthUser } from '../../../auth/domain/auth.types.ts'
import { Link } from 'react-router-dom'

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
          Học sinh
        </div>
        <div className="student-header__greeting hide-on-mobile">
          <strong>Cố lên nào, {user.fullName.split(' ').slice(-2).join(' ') || user.fullName}!</strong>
          <span>Hôm nay bạn muốn chinh phục kỹ năng nào?</span>
        </div>
      </div>

      <div className="student-header__right">
        <span className="student-header__pill hide-on-mobile">
          <span className="material-symbols-outlined" aria-hidden="true">local_fire_department</span>
          1 ngày
        </span>
        <span className="student-header__pill student-header__pill--xp hide-on-mobile">
          <span className="material-symbols-outlined" aria-hidden="true">bolt</span>
          +2 XP
        </span>
        <Link className="student-header__profile" to="/student/profile" aria-label="Mở hồ sơ">
          <img 
            alt="User Avatar" 
            className="student-header__avatar"
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
          />
          <span className="hide-on-mobile">
            <strong>{user.fullName}</strong>
            <small>Xem hồ sơ</small>
          </span>
        </Link>
      </div>
    </header>
  )
}
