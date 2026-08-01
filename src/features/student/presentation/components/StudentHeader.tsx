import type { AuthUser } from '../../../auth/domain/auth.types.ts'

type StudentHeaderProps = {
  user: AuthUser
  onMenuClick?: () => void
}

export function StudentHeader({ user, onMenuClick }: StudentHeaderProps) {
  return (
    <header className="student-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px' }}>
      {/* Left side: Mobile Menu + Logo + Role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="student-header__mobile-menu">
          <button className="student-header__icon-btn" onClick={onMenuClick}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        <div className="header-brand-mobile-only" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)' }}>
          E-Learning
        </div>
        <div className="header-brand-mobile-only" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
          Học viên
        </div>
      </div>

      {/* Right side: Name + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text)' }} className="hide-on-mobile">
          {user.fullName}
        </span>
        <button className="student-header__avatar" style={{ overflow: 'hidden', padding: 0, width: '40px', height: '40px', border: '2px solid var(--color-primary-soft)' }}>
          <img 
            alt="User Avatar" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
          />
        </button>
      </div>
    </header>
  )
}
