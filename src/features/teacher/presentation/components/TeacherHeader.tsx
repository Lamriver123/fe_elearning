import type { AuthUser } from '../../../auth/domain/auth.types'

type TeacherHeaderProps = {
  user: AuthUser
  onMenuClick?: () => void
}

export function TeacherHeader({ user, onMenuClick }: TeacherHeaderProps) {
  return (
    <header className="teacher-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px' }}>
      {/* Left side: Mobile Menu + Logo + Role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="teacher-header__mobile-menu">
          <button className="teacher-header__icon-btn" onClick={onMenuClick}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        <div className="header-brand-mobile-only" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)' }}>
          E-Learning
        </div>
        <div className="header-brand-mobile-only" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
          Giáo viên
        </div>
      </div>

      {/* Right side: Name + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text)' }} className="hide-on-mobile">
          {user.fullName}
        </span>
        <div className="teacher-header__avatar" style={{ overflow: 'hidden', padding: 0, width: '40px', height: '40px', border: '2px solid var(--color-primary-soft)' }}>
          <img 
            alt="User avatar" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
          />
        </div>
      </div>
    </header>
  )
}
